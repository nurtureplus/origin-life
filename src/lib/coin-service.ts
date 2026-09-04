import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { coinsForSpend, coinExpiryFrom, COIN_VALIDITY_DAYS } from "@/lib/coins";

type Tx = Prisma.TransactionClient;

/**
 * Sum of coins in lots that haven't expired.
 * Lots are the source of truth; `Customer.lifeCoins` mirrors this.
 */
export async function getAvailableBalance(
  tx: Tx | typeof prisma,
  customerId: string
): Promise<number> {
  const lots = await tx.coinLot.findMany({
    where: { customerId, expiresAt: { gt: new Date() }, remaining: { gt: 0 } },
    select: { remaining: true },
  });
  return lots.reduce((sum, l) => sum + l.remaining, 0);
}

/** Recompute the cached balance from live lots. */
async function syncBalance(tx: Tx, customerId: string): Promise<number> {
  const balance = await getAvailableBalance(tx, customerId);
  await tx.customer.update({ where: { id: customerId }, data: { lifeCoins: balance } });
  return balance;
}

/** Append an audit row. Never the source of truth — lots are. */
async function logMovement(
  tx: Tx,
  params: {
    customerId: string;
    orderId?: string | null;
    type: string;
    amount: number;
    balanceAfter: number;
    note?: string;
  }
) {
  try {
    await tx.coinTransaction.create({
      data: {
        customerId: params.customerId,
        orderId: params.orderId ?? null,
        type: params.type,
        amount: params.amount,
        balanceAfter: params.balanceAfter,
        note: params.note ?? null,
      },
    });
  } catch (e) {
    // (orderId, type) is unique — a duplicate just means this already ran.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
}

/**
 * Spend coins on an order, consuming soonest-expiring lots first so the
 * customer loses as little as possible to expiry.
 *
 * Runs inside the caller's transaction so the debit and the order commit together.
 */
export async function redeemCoinsForOrder(
  tx: Tx,
  params: { customerId: string; orderId: string; coins: number }
) {
  const { customerId, orderId } = params;
  let toSpend = Math.floor(params.coins);
  if (toSpend <= 0) return;

  const lots = await tx.coinLot.findMany({
    where: { customerId, expiresAt: { gt: new Date() }, remaining: { gt: 0 } },
    orderBy: { expiresAt: "asc" },
  });

  for (const lot of lots) {
    if (toSpend <= 0) break;
    const take = Math.min(lot.remaining, toSpend);
    await tx.coinLot.update({
      where: { id: lot.id },
      data: { remaining: lot.remaining - take },
    });
    toSpend -= take;
  }

  const balanceAfter = await syncBalance(tx, customerId);
  await logMovement(tx, {
    customerId,
    orderId,
    type: "redeemed",
    amount: -(params.coins - toSpend),
    balanceAfter,
    note: `Applied to order ${orderId.slice(-8)}`,
  });
}

/**
 * Credit coins once an order is DELIVERED (not merely paid) — the programme
 * pays out on fulfilment, not on payment.
 *
 * Earn base is the product spend actually paid for: subtotal minus any coin
 * discount, excluding shipping. That stops coins being farmed by redeeming
 * coins, and stops shipping inflating rewards.
 */
export async function awardCoinsForDeliveredOrder(orderId: string): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || !order.customerId) return 0;

    // Unique orderId on CoinLot makes re-delivery a no-op.
    const already = await tx.coinLot.findUnique({ where: { orderId: order.id } });
    if (already) return 0;

    const eligibleSpend = Math.max(0, order.subtotalCents - order.discountCents);
    const coins = coinsForSpend(eligibleSpend);
    if (coins <= 0) return 0;

    await tx.coinLot.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        amount: coins,
        remaining: coins,
        expiresAt: coinExpiryFrom(),
      },
    });

    const balanceAfter = await syncBalance(tx, order.customerId);
    await logMovement(tx, {
      customerId: order.customerId,
      orderId: order.id,
      type: "earned",
      amount: coins,
      balanceAfter,
      note: `Delivered order ${order.id.slice(-8)}`,
    });

    await tx.order.update({ where: { id: order.id }, data: { coinsEarned: coins } });
    return coins;
  });
}

/**
 * Undo an order's coin effects on cancellation: withdraw anything it earned and
 * hand back anything it spent. Without this, order → earn → cancel would let a
 * customer keep coins for a purchase that never completed.
 */
export async function reverseCoinsForCancelledOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || !order.customerId) return;
    const customerId = order.customerId;

    // Withdraw the lot this order created (only the unspent part can be taken
    // back — anything already spent is water under the bridge).
    const lot = await tx.coinLot.findUnique({ where: { orderId: order.id } });
    if (lot) {
      await tx.coinLot.update({ where: { id: lot.id }, data: { remaining: 0 } });
      const balanceAfter = await syncBalance(tx, customerId);
      await logMovement(tx, {
        customerId,
        orderId: order.id,
        type: "earn_reversed",
        amount: -lot.remaining,
        balanceAfter,
        note: `Order ${order.id.slice(-8)} cancelled`,
      });
    }

    // Return redeemed coins as a fresh lot. Original expiry isn't recoverable
    // once lots are merged, so a new validity window starts from the refund —
    // erring in the customer's favour.
    if (order.coinsRedeemed > 0) {
      const existingRefund = await tx.coinTransaction.findFirst({
        where: { orderId: order.id, type: "redeem_refunded" },
      });
      if (!existingRefund) {
        await tx.coinLot.create({
          data: {
            customerId,
            orderId: null,
            amount: order.coinsRedeemed,
            remaining: order.coinsRedeemed,
            expiresAt: coinExpiryFrom(),
          },
        });
        const balanceAfter = await syncBalance(tx, customerId);
        await logMovement(tx, {
          customerId,
          orderId: order.id,
          type: "redeem_refunded",
          amount: order.coinsRedeemed,
          balanceAfter,
          note: `Order ${order.id.slice(-8)} cancelled`,
        });
      }
    }
  });
}

/**
 * Reconcile a customer's cached balance with their lots, logging any coins that
 * lapsed since the last check. Called on account read so expiry surfaces
 * without needing a scheduled job.
 */
export async function reconcileExpiredCoins(customerId: string): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      select: { lifeCoins: true },
    });
    if (!customer) return 0;

    const live = await getAvailableBalance(tx, customerId);
    const lapsed = customer.lifeCoins - live;
    if (lapsed <= 0) return live;

    await tx.customer.update({ where: { id: customerId }, data: { lifeCoins: live } });
    await tx.coinTransaction.create({
      data: {
        customerId,
        orderId: null,
        type: "expired",
        amount: -lapsed,
        balanceAfter: live,
        note: `Coins passed their ${COIN_VALIDITY_DAYS}-day validity`,
      },
    });
    return live;
  });
}
