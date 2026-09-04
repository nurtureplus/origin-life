import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BLOG_CATEGORIES, formatPostDate, isBlogCategory } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "New supplement launches, health insights, and how we formulate at OriginLife.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = isBlogCategory(category) ? category : null;

  const posts = await prisma.blogPost.findMany({
    where: { published: true, ...(active ? { category: active } : {}) },
    orderBy: { publishedAt: "desc" },
  });

  const [lead, ...rest] = posts;

  return (
    <div className="container-page py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-ink-faint">Journal</p>
        <h1 className="text-display mt-3 text-5xl font-medium md:text-6xl">
          New supplements &amp; health insights
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Launch notes, label literacy, and the thinking behind how we formulate.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-full border px-4 py-2 text-sm transition ${
            !active
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          All
        </Link>
        {BLOG_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/blog?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              active === c
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">
          No articles here yet — check back soon.
        </p>
      ) : (
        <>
          {/* Lead article gets a wider treatment. */}
          <Link
            href={`/blog/${lead.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-line bg-paper-soft transition hover:border-ink md:grid-cols-2"
          >
            <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lead.coverImage}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-ink-faint">
                {lead.category} · {lead.readMinutes} min read
              </p>
              <h2 className="font-heading mt-3 text-3xl font-medium tracking-tight md:text-4xl">
                {lead.title}
              </h2>
              <p className="mt-3 text-ink-soft">{lead.excerpt}</p>
              <p className="mt-6 text-xs text-ink-faint">{formatPostDate(lead.publishedAt)}</p>
            </div>
          </Link>

          {rest.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-soft transition hover:border-ink"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs uppercase tracking-widest text-ink-faint">
                      {post.category} · {post.readMinutes} min
                    </p>
                    <h2 className="font-heading mt-2 text-lg font-medium tracking-tight">{post.title}</h2>
                    <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p>
                    <p className="mt-auto pt-4 text-xs text-ink-faint">
                      {formatPostDate(post.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
