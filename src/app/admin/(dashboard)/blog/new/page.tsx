import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-display text-3xl font-medium">New post</h1>
      <div className="mt-8">
        <BlogPostForm />
      </div>
    </div>
  );
}
