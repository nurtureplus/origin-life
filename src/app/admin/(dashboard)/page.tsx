import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminDashboardPage() {
  const [orderCount, productCount, customerCount, orders, lowStock, earningOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: true },
      }),
      prisma.product.findMany({ where: { stock: { lt: 15 }, active: true } }),
      // Same definition the sales report uses: pending orders were never paid
      // for, so counting them would overstate revenue.
      prisma.order.findMany({
        where: { status: { notIn: ["cancelled", "pending"] } },
        select: { totalCents: true },
      }),
    ]);

  const revenueCents = earningOrders.reduce((sum, o) => sum + o.totalCents, 0);

  const stats = [
    { label: "Total orders", value: orderCount },
    { label: "Revenue", value: formatPrice(revenueCents) },
    { label: "Registered customers", value: customerCount },
    { label: "Products", value: productCount },
    { label: "Low stock", value: lowStock.length },
  ];

  return (
    <div>
      <h1 className="text-display text-3xl font-medium">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-paper-soft p-5">
            <p className="text-xs uppercase tracking-widest text-ink-faint">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-paper-soft">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-sm font-medium">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-ink-soft underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="divide-y divide-line">
          {orders.length === 0 && <p className="px-6 py-6 text-sm text-ink-faint">No orders yet.</p>}
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between px-6 py-4 text-sm transition hover:bg-line/30"
            >
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-ink-faint">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="font-medium">{formatPrice(order.totalCents)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 rounded-2xl border border-line bg-paper-soft p-6">
          <h2 className="text-sm font-medium">Low stock</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span>{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
