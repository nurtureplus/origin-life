import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { ReportDownload } from "@/components/admin/ReportDownload";
import { pendingCoinsForOrder } from "@/lib/coins";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-display text-3xl font-medium">Orders</h1>

      <div className="mt-8">
        <ReportDownload report="sales" withRange label="Download sales report" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Items</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Coins</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-ink-faint">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-line/30">
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium">
                    {order.customerName}
                  </Link>
                  <p className="text-ink-faint">{order.customerEmail}</p>
                </td>
                <td className="px-6 py-4 text-ink-soft">{order.items.length}</td>
                <td className="px-6 py-4 font-medium">{formatPrice(order.totalCents)}</td>
                <td className="px-6 py-4 text-ink-soft">
                  {order.coinsEarned > 0 ? (
                    <span className="text-accent">+{order.coinsEarned}</span>
                  ) : pendingCoinsForOrder(order) > 0 && order.customerId ? (
                    <span title="Credited when you mark this order delivered">
                      +{pendingCoinsForOrder(order)} pending
                    </span>
                  ) : (
                    "—"
                  )}
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
    </div>
  );
}
