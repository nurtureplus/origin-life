/**
 * Builds the two admin reports — sales and registered customers — as
 * `ReportSpec`s that `report-export` can render to Excel, PDF or CSV.
 */
import { prisma } from "@/lib/prisma";
import type { ReportSpec } from "@/lib/report-export";
import { formatReportMoney, formatReportDate } from "@/lib/report-export";

/** Orders in these states never counted as revenue. */
const NON_REVENUE_STATUSES = new Set(["cancelled", "pending"]);

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const bare = digits.length > 10 ? digits.slice(-10) : digits;
  return bare.length === 10 ? `+91${bare}` : phone;
}

/** `2026-08-02` → that instant at IST midnight, so ranges line up with days. */
function parseRangeDate(value: string | null, endOfDay = false): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const suffix = endOfDay ? "T23:59:59.999+05:30" : "T00:00:00.000+05:30";
  const d = new Date(`${value}${suffix}`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function parseReportRange(params: URLSearchParams): { from?: Date; to?: Date } {
  return {
    from: parseRangeDate(params.get("from")),
    to: parseRangeDate(params.get("to"), true),
  };
}

function rangeLabel(from?: Date, to?: Date): string {
  if (from && to) return `${formatReportDate(from)} – ${formatReportDate(to)}`;
  if (from) return `From ${formatReportDate(from)}`;
  if (to) return `Up to ${formatReportDate(to)}`;
  return "All time";
}

// ------------------------------------------------------------------- sales

type SalesRow = {
  id: string;
  createdAt: Date;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  state: string;
  postalCode: string;
  units: number;
  products: string;
  subtotalCents: number;
  shippingCents: number;
  coinsRedeemed: number;
  discountCents: number;
  totalCents: number;
  coinsEarned: number;
  razorpayPaymentId: string | null;
  registered: boolean;
};

export async function buildSalesReport(range: {
  from?: Date;
  to?: Date;
}): Promise<ReportSpec<SalesRow>> {
  const where =
    range.from || range.to
      ? { createdAt: { ...(range.from && { gte: range.from }), ...(range.to && { lte: range.to }) } }
      : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const rows: SalesRow[] = orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    city: o.city,
    state: o.state,
    postalCode: o.postalCode,
    units: o.items.reduce((sum, i) => sum + i.quantity, 0),
    products: o.items.map((i) => `${i.name} ×${i.quantity}`).join(", "),
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    coinsRedeemed: o.coinsRedeemed,
    discountCents: o.discountCents,
    totalCents: o.totalCents,
    coinsEarned: o.coinsEarned,
    razorpayPaymentId: o.razorpayPaymentId,
    registered: o.customerId !== null,
  }));

  const earning = rows.filter((r) => !NON_REVENUE_STATUSES.has(r.status));
  const revenue = earning.reduce((s, r) => s + r.totalCents, 0);
  const units = earning.reduce((s, r) => s + r.units, 0);
  const cancelled = rows.filter((r) => r.status === "cancelled").length;

  return {
    title: "Sales report",
    subtitle: `OriginLife · ${rangeLabel(range.from, range.to)}`,
    filename: `originlife-sales-${range.from ? formatFileDate(range.from) : "all"}-to-${
      range.to ? formatFileDate(range.to) : "now"
    }`,
    summary: [
      { label: "Orders", value: String(rows.length) },
      { label: "Revenue", value: formatReportMoney(revenue) },
      { label: "Units sold", value: String(units) },
      {
        label: "Avg order",
        value: formatReportMoney(earning.length ? Math.round(revenue / earning.length) : 0),
      },
      { label: "Cancelled", value: String(cancelled) },
    ],
    rows,
    columns: [
      { header: "Order", width: 12, value: (r) => r.id.slice(-8).toUpperCase() },
      { header: "Date", width: 19, type: "datetime", value: (r) => r.createdAt },
      { header: "Status", width: 11, value: (r) => r.status },
      { header: "Customer", width: 20, value: (r) => r.customerName },
      { header: "Phone", width: 14, value: (r) => r.customerPhone },
      { header: "Email", width: 28, value: (r) => r.customerEmail, omitInPdf: true },
      { header: "City", width: 14, value: (r) => r.city },
      { header: "State", width: 14, value: (r) => r.state, omitInPdf: true },
      { header: "PIN", width: 10, value: (r) => r.postalCode, omitInPdf: true },
      { header: "Account", width: 11, value: (r) => (r.registered ? "Registered" : "Guest") },
      { header: "Products", width: 42, value: (r) => r.products, omitInPdf: true },
      { header: "Units", width: 8, type: "number", value: (r) => r.units, total: true },
      { header: "Subtotal", width: 13, type: "money", value: (r) => r.subtotalCents, total: true },
      { header: "Shipping", width: 12, type: "money", value: (r) => r.shippingCents, total: true },
      { header: "Coins used", width: 11, type: "number", value: (r) => r.coinsRedeemed, total: true },
      { header: "Discount", width: 12, type: "money", value: (r) => r.discountCents, total: true },
      { header: "Total", width: 14, type: "money", value: (r) => r.totalCents, total: true },
      { header: "Coins earned", width: 12, type: "number", value: (r) => r.coinsEarned, total: true },
      {
        header: "Payment ID",
        width: 24,
        value: (r) => r.razorpayPaymentId,
        omitInPdf: true,
      },
    ],
  };
}

// --------------------------------------------------------------- customers

type CustomerRow = {
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
  orderCount: number;
  spentCents: number;
  lastOrderAt: Date | null;
  lifeCoins: number;
};

export type CustomerListEntry = CustomerRow & { id: string };

/**
 * Every registered account with its order history rolled up. Used both by the
 * admin customers table and by the downloadable contact list.
 */
export async function getCustomerList(): Promise<CustomerListEntry[]> {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { totalCents: true, status: true, createdAt: true } },
    },
  });

  return customers.map((c) => {
    const counted = c.orders.filter((o) => !NON_REVENUE_STATUSES.has(o.status));
    const lastOrder = c.orders.reduce<Date | null>(
      (latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest),
      null
    );
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      createdAt: c.createdAt,
      orderCount: counted.length,
      spentCents: counted.reduce((s, o) => s + o.totalCents, 0),
      lastOrderAt: lastOrder,
      lifeCoins: c.lifeCoins,
    };
  });
}

/** How many of these accounts registered within the last `days` days. */
export function countRegisteredWithin(customers: CustomerListEntry[], days: number): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return customers.filter((c) => c.createdAt >= cutoff).length;
}

export async function buildCustomersReport(): Promise<ReportSpec<CustomerListEntry>> {
  const rows = await getCustomerList();
  const buyers = rows.filter((r) => r.orderCount > 0);
  const spent = rows.reduce((s, r) => s + r.spentCents, 0);

  return {
    title: "Registered customers",
    subtitle: `OriginLife · ${rows.length} account${rows.length === 1 ? "" : "s"} as of ${formatReportDate(new Date())}`,
    filename: `originlife-customers-${formatFileDate(new Date())}`,
    summary: [
      { label: "Registered", value: String(rows.length) },
      { label: "Have ordered", value: String(buyers.length) },
      { label: "Never ordered", value: String(rows.length - buyers.length) },
      { label: "Lifetime value", value: formatReportMoney(spent) },
      {
        label: "Avg per buyer",
        value: formatReportMoney(buyers.length ? Math.round(spent / buyers.length) : 0),
      },
    ],
    rows,
    columns: [
      { header: "Name", width: 24, value: (r) => r.name },
      { header: "Phone", width: 14, value: (r) => r.phone },
      // E.164 imports cleanly into SMS and WhatsApp campaign tools.
      { header: "Phone (intl)", width: 16, value: (r) => toE164(r.phone), omitInPdf: true },
      { header: "Email", width: 30, value: (r) => r.email },
      { header: "Registered", width: 19, type: "datetime", value: (r) => r.createdAt },
      { header: "Orders", width: 9, type: "number", value: (r) => r.orderCount, total: true },
      { header: "Total spent", width: 15, type: "money", value: (r) => r.spentCents, total: true },
      { header: "Last order", width: 15, type: "date", value: (r) => r.lastOrderAt },
      { header: "Life Coins", width: 11, type: "number", value: (r) => r.lifeCoins, total: true },
    ],
  };
}

function formatFileDate(d: Date): string {
  // Local (IST) calendar date, so a file downloaded on 2 Aug is named 2 Aug.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}
