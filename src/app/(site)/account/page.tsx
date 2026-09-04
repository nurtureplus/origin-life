import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { verifyCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { AccountLogoutButton } from "@/components/AccountLogoutButton";
import {
  coinTransactionLabel,
  coinsToDiscountPaise,
  MIN_ORDER_TO_REDEEM_PAISE,
  COIN_VALIDITY_DAYS,
  totalPendingCoins,
  pendingCoinsForOrder,
} from "@/lib/coins";
import { reconcileExpiredCoins } from "@/lib/coin-service";
import { formatPhone } from "@/lib/phone";
import { buttonClass } from "@/lib/button";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  const session = token ? await verifyCustomerSessionToken(token) : null;
  if (!session) redirect("/account/login");

  // Retire any lapsed coins before rendering, so the balance shown is real.
  await reconcileExpiredCoins(session.sub);

  const [customer, orders, ledger, lots] = await Promise.all([
    prisma.customer.findUnique({ where: { id: session.sub } }),
    prisma.order.findMany({
      where: { customerId: session.sub },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coinTransaction.findMany({
      where: { customerId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.coinLot.findMany({
      where: { customerId: session.sub, remaining: { gt: 0 }, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "asc" },
    }),
  ]);
  if (!customer) redirect("/account/login");

  const nextToExpire = lots[0] ?? null;
  // Coins already bought but not yet credited, because the order hasn't been
  // delivered. Without this the page reads a bare 0 after a purchase and the
  // programme looks broken.
  const pendingCoins = totalPendingCoins(orders);

  return (
    <div className="container-page py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">My account</p>
          <h1 className="text-display mt-2 text-4xl font-medium">
            Hi, {customer.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {formatPhone(customer.phone)} · {customer.email}
          </p>
        </div>
        <AccountLogoutButton />
      </div>

      {/* Life Coins */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <div className="flex flex-col gap-4 bg-paper-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-faint">Life Coins</p>
            <p className="text-display mt-2 text-4xl font-medium">{customer.lifeCoins}</p>
            <p className="mt-1 text-sm text-ink-soft">
              Worth {formatPrice(coinsToDiscountPaise(customer.lifeCoins))} off a future order.
            </p>
            {pendingCoins > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                +{pendingCoins} on the way
                <span className="font-normal text-ink-soft">
                  · credited once delivered
                </span>
              </p>
            )}
            {nextToExpire && (
              <p className="mt-2 text-xs text-ink-faint">
                {nextToExpire.remaining} coin{nextToExpire.remaining === 1 ? "" : "s"} expire on{" "}
                {new Date(nextToExpire.expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                .
              </p>
            )}
          </div>
          <ul className="max-w-xs space-y-1 text-sm text-ink-soft sm:text-right">
            <li>
              Earn <strong className="text-ink">2% back</strong> in Life Coins on every order.
            </li>
            <li>
              <strong className="text-ink">1 Life Coin = ₹1.</strong>
            </li>
            <li>Redeem up to 2% of your next order.</li>
            <li>Minimum order {formatPrice(MIN_ORDER_TO_REDEEM_PAISE)} to redeem.</li>
            <li>Credited once delivered · valid {COIN_VALIDITY_DAYS} days.</li>
          </ul>
        </div>

        {ledger.length > 0 && (
          <div className="divide-y divide-line border-t border-line">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <div>
                  <p>{coinTransactionLabel(entry.type)}</p>
                  <p className="text-xs text-ink-faint">
                    {new Date(entry.createdAt).toLocaleDateString()}
                    {entry.orderId ? ` · #${entry.orderId.slice(-8)}` : ""}
                  </p>
                </div>
                <span
                  className={`font-medium ${entry.amount > 0 ? "text-accent" : "text-ink-soft"}`}
                >
                  {entry.amount > 0 ? "+" : ""}
                  {entry.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
          Order history
        </h2>

        {orders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-paper-soft p-8 text-center">
            <p className="text-ink-soft">You haven&apos;t placed an order yet.</p>
            <Link
              href="/products"
              className={buttonClass({ className: "mt-4" })}
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-paper-soft">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Items</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Coins</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      <Link
                        href={`/order/${order.id}`}
                        className="font-medium underline underline-offset-4"
                      >
                        #{order.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-ink-soft">{order.items.length}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(order.totalCents)}</td>
                    <td className="px-6 py-4 text-ink-soft">
                      {order.coinsEarned > 0 && (
                        <span className="text-accent">+{order.coinsEarned}</span>
                      )}
                      {order.coinsEarned > 0 && order.coinsRedeemed > 0 && " / "}
                      {order.coinsRedeemed > 0 && <span>−{order.coinsRedeemed}</span>}
                      {order.coinsEarned === 0 && pendingCoinsForOrder(order) > 0 && (
                        <span
                          className="text-ink-faint"
                          title="Credited when this order is delivered"
                        >
                          +{pendingCoinsForOrder(order)} pending
                        </span>
                      )}
                      {order.coinsEarned === 0 &&
                        order.coinsRedeemed === 0 &&
                        pendingCoinsForOrder(order) === 0 &&
                        "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-ink-soft">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
