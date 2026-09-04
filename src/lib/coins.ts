/**
 * Life Coins — OriginLife's customer reward currency.
 *
 * Programme rules:
 *   Earn      2% of order value, credited once the order is DELIVERED.
 *   Redeem    up to 2% of the new order's value, and never more than the balance.
 *   Minimum   orders below ₹1,000 can't redeem.
 *   Validity  coins expire 60 days after they're credited, and are spent
 *             soonest-expiring-first so customers lose as few as possible.
 *   1 Life Coin = ₹1.
 *
 * Coins can't be spent on the order that earned them (earning happens at
 * delivery, so this is structurally impossible), can't be exchanged for cash,
 * and can't be transferred between accounts.
 *
 * Money is stored in paise (1/100 rupee) under the historical `...Cents`
 * field names, so these helpers take and return paise.
 */

/** Share of order value returned as coins. */
export const EARN_RATE = 0.02;
/** Share of a new order that coins may cover. */
export const REDEEM_RATE = 0.02;
/** Paise a single Life Coin is worth. */
export const COIN_VALUE_PAISE = 100;
/** Orders below this can't redeem coins. */
export const MIN_ORDER_TO_REDEEM_PAISE = 1000_00; // ₹1,000
/** Days a credited coin stays usable. */
export const COIN_VALIDITY_DAYS = 60;

/**
 * Coins earned on a delivered order. Rounds down, so ₹2,000 earns 40.
 * Pass the amount actually paid for products — excluding shipping and
 * excluding any part settled with coins.
 */
export function coinsForSpend(spendPaise: number): number {
  if (spendPaise <= 0) return 0;
  return Math.floor((spendPaise * EARN_RATE) / COIN_VALUE_PAISE);
}

/** Rupee (paise) discount a number of coins buys. */
export function coinsToDiscountPaise(coins: number): number {
  return Math.max(0, Math.floor(coins)) * COIN_VALUE_PAISE;
}

/** True when an order is large enough to allow redemption at all. */
export function orderQualifiesForRedemption(subtotalPaise: number): boolean {
  return subtotalPaise >= MIN_ORDER_TO_REDEEM_PAISE;
}

/**
 * How many coins may actually be applied to an order.
 *
 * Capped by (a) the 2% ceiling on this order, (b) the customer's balance, and
 * (c) the minimum-order rule. Returns 0 when the order is too small.
 */
export function maxRedeemableCoins(balance: number, subtotalPaise: number): number {
  if (!orderQualifiesForRedemption(subtotalPaise)) return 0;
  const capByOrder = Math.floor((subtotalPaise * REDEEM_RATE) / COIN_VALUE_PAISE);
  return Math.max(0, Math.min(Math.floor(balance), capByOrder));
}

/**
 * Order states that have not earned their coins yet but still will. Coins land
 * on delivery, so between paying and receiving there is a window where a
 * customer has earned nothing on paper — showing this as "pending" is the
 * difference between the programme looking broken and looking like it works.
 */
const PENDING_EARN_STATUSES = new Set(["paid", "shipped"]);

/** Coins this order will credit once it is marked delivered. */
export function pendingCoinsForOrder(order: {
  status: string;
  subtotalCents: number;
  discountCents: number;
}): number {
  if (!PENDING_EARN_STATUSES.has(order.status)) return 0;
  return coinsForSpend(order.subtotalCents - order.discountCents);
}

/** Total coins awaiting delivery across a set of orders. */
export function totalPendingCoins(
  orders: { status: string; subtotalCents: number; discountCents: number }[]
): number {
  return orders.reduce((sum, o) => sum + pendingCoinsForOrder(o), 0);
}

/** Expiry timestamp for coins credited at `from`. */
export function coinExpiryFrom(from: Date = new Date()): Date {
  return new Date(from.getTime() + COIN_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
}

/** Human label for a ledger entry type. */
export function coinTransactionLabel(type: string): string {
  switch (type) {
    case "earned":
      return "Earned on delivered order";
    case "redeemed":
      return "Redeemed at checkout";
    case "earn_reversed":
      return "Reversed — order cancelled";
    case "redeem_refunded":
      return "Refunded — order cancelled";
    case "expired":
      return "Expired";
    case "adjustment":
      return "Manual adjustment";
    default:
      return type;
  }
}
