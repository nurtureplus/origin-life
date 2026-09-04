import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPostDate, parseArticle } from "@/lib/blog";
import { buttonClass } from "@/lib/button";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      images: [{ url: post.coverImage }],
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  const blocks = parseArticle(post.content);

  const related = await prisma.blogPost.findMany({
    where: { published: true, category: post.category, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="py-16">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <article className="container-page">
        <div className="mx-auto max-w-2xl">
          <Link href="/blog" className="text-sm text-ink-soft transition hover:text-ink">
            ← All articles
          </Link>

          <p className="mt-8 text-xs uppercase tracking-widest text-ink-faint">
            {post.category} · {post.readMinutes} min read
          </p>
          <h1 className="text-display mt-3 text-4xl font-medium md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>
          <p className="mt-6 text-sm text-ink-faint">
            {post.author} · {formatPostDate(post.publishedAt)}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt="" className="aspect-[16/7] w-full object-cover" />
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          {blocks.map((block, i) =>
            block.type === "heading" ? (
              <h2
                key={i}
                className="font-heading mt-10 text-2xl tracking-tight first:mt-0 md:text-3xl"
              >
                {block.text}
              </h2>
            ) : (
              <p key={i} className="mt-5 leading-relaxed text-ink-soft first:mt-0">
                {block.text}
              </p>
            )
          )}
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-line bg-paper-soft p-6 text-center">
          <p className="text-ink-soft">
            Every OriginLife formula is dosed at clinically studied levels and third-party tested.
          </p>
          <Link
            href="/products"
            className={buttonClass({ className: "mt-4" })}
          >
            Shop the lineup
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-page mt-20">
          <h2 className="text-display text-2xl font-medium md:text-3xl">More on {post.category}</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-soft transition hover:border-ink"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-widest text-ink-faint">
                    {r.readMinutes} min read
                  </p>
                  <h3 className="font-heading mt-2 text-lg font-medium tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
