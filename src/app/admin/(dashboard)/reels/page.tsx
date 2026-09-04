import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonClass } from "@/lib/button";

export default async function AdminReelsPage() {
  const reels = await prisma.reel.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display text-3xl font-medium">Reels</h1>
        <Link
          href="/admin/reels/new"
          className={buttonClass()}
        >
          + New reel
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Upload the same vertical video clips you post as Instagram reels — they&apos;ll autoplay
        in a slider on the homepage.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-3 font-medium">Reel</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reels.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-ink-faint">
                  No reels yet. Upload your first one — the homepage section stays hidden until
                  then.
                </td>
              </tr>
            )}
            {reels.map((r) => (
              <tr key={r.id} className="transition hover:bg-line/30">
                <td className="px-6 py-4">
                  <Link href={`/admin/reels/${r.id}`} className="flex items-center gap-3">
                    <div className="h-14 w-9 overflow-hidden rounded-lg border border-line bg-dark">
                      {r.thumbnail ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={r.thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={r.videoUrl} className="h-full w-full object-cover" muted />
                      )}
                    </div>
                    <p className="font-medium">{r.title}</p>
                  </Link>
                </td>
                <td className="px-6 py-4 text-ink-soft">{r.order}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.active ? "bg-green-100 text-green-800" : "bg-line text-ink-soft"
                    }`}
                  >
                    {r.active ? "Active" : "Hidden"}
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
