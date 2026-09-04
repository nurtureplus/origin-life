import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonClass } from "@/lib/button";

export default async function AdminPromosPage() {
  const promos = await prisma.promo.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display text-3xl font-medium">Hero slides</h1>
        <Link
          href="/admin/promos/new"
          className={buttonClass()}
        >
          + New slide
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        These rotate in the homepage hero banner — offers, new arrivals, featured products, and
        campaigns. The brand slide always shows first, then these in order.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-3 font-medium">Slide</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {promos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-ink-faint">
                  No hero slides yet — the hero shows just the brand slide. Create your first one.
                </td>
              </tr>
            )}
            {promos.map((p) => (
              <tr key={p.id} className="transition hover:bg-line/30">
                <td className="px-6 py-4">
                  <Link href={`/admin/promos/${p.id}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="h-10 w-16 rounded-lg border border-line object-cover" />
                    <div>
                      <p className="font-medium">{p.title}</p>
                      {p.subtitle && <p className="text-ink-faint">{p.subtitle}</p>}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-ink-soft">{p.order}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.active ? "bg-green-100 text-green-800" : "bg-line text-ink-soft"
                    }`}
                  >
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
