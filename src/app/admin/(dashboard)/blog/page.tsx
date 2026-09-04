import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPostDate } from "@/lib/blog";
import { buttonClass } from "@/lib/button";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display text-3xl font-medium">Blog</h1>
        <Link
          href="/admin/blog/new"
          className={buttonClass()}
        >
          + New post
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Articles on new supplements, health insights, and the brand. Unpublished posts stay
        hidden from the site.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-3 font-medium">Post</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-ink-faint">
                  No posts yet. Write your first one.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="transition hover:bg-line/30">
                <td className="px-6 py-4">
                  <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.coverImage}
                      alt=""
                      className="h-10 w-16 rounded-lg border border-line object-cover"
                    />
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-ink-faint">{p.readMinutes} min read</p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-ink-soft">{p.category}</td>
                <td className="px-6 py-4 text-ink-soft">{formatPostDate(p.publishedAt)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.published ? "bg-green-100 text-green-800" : "bg-line text-ink-soft"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
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
