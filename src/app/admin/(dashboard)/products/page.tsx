import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { buttonClass } from "@/lib/button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display text-3xl font-medium">Products</h1>
        <Link
          href="/admin/products/new"
          className={buttonClass()}
        >
          + New product
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-line/30">
                <td className="px-6 py-4">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="h-10 w-10 rounded-lg border border-line object-cover" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-ink-faint">{p.tagline}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-ink-soft">{p.category}</td>
                <td className="px-6 py-4">{formatPrice(p.priceCents)}</td>
                <td className="px-6 py-4">{p.stock}</td>
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
