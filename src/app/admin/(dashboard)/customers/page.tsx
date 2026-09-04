import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { countRegisteredWithin, getCustomerList } from "@/lib/report-data";
import { ReportDownload } from "@/components/admin/ReportDownload";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customers, guestOrders] = await Promise.all([
    getCustomerList(),
    // Checkout allows guests, so the registered list isn't the whole audience.
    prisma.order.findMany({
      where: { customerId: null },
      select: { customerPhone: true },
      distinct: ["customerPhone"],
    }),
  ]);

  const buyers = customers.filter((c) => c.orderCount > 0);
  const spent = customers.reduce((s, c) => s + c.spentCents, 0);
  const recent = countRegisteredWithin(customers, 30);

  const stats = [
    { label: "Registered", value: String(customers.length) },
    { label: "New in 30 days", value: String(recent) },
    { label: "Have ordered", value: String(buyers.length) },
    { label: "Never ordered", value: String(customers.length - buyers.length) },
    { label: "Lifetime value", value: formatPrice(spent) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl font-medium">Customers</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {customers.length} registered account{customers.length === 1 ? "" : "s"}
            {guestOrders.length > 0 && (
              <>
                {" "}
                · {guestOrders.length} guest buyer{guestOrders.length === 1 ? "" : "s"} not in this
                list
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-paper-soft p-5">
            <p className="text-xs uppercase tracking-widest text-ink-faint">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <ReportDownload report="customers" label="Download customer list" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper-soft">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Registered</th>
              <th className="px-6 py-3 font-medium">Orders</th>
              <th className="px-6 py-3 font-medium">Spent</th>
              <th className="px-6 py-3 font-medium">Coins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-ink-faint">
                  No one has registered yet.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="transition hover:bg-line/30">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">
                  <a href={`tel:${c.phone}`} className="text-ink-soft hover:text-ink">
                    {formatPhone(c.phone)}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <a href={`mailto:${c.email}`} className="text-ink-soft hover:text-ink">
                    {c.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-ink-soft">
                  {c.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-ink-soft">{c.orderCount || "—"}</td>
                <td className="px-6 py-4 font-medium">
                  {c.spentCents > 0 ? formatPrice(c.spentCents) : "—"}
                </td>
                <td className="px-6 py-4 text-ink-soft">{c.lifeCoins || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
