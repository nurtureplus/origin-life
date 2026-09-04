import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display text-3xl font-medium">Edit post</h1>
        {post.published && (
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            View on site →
          </Link>
        )}
      </div>
      <div className="mt-8">
        <BlogPostForm post={post} />
      </div>
    </div>
  );
}
