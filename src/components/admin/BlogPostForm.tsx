"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { BlogPost } from "@prisma/client";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { buttonClass } from "@/lib/button";

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  readMinutes: string;
  featured: boolean;
  published: boolean;
};

function toFormState(p?: BlogPost): FormState {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    excerpt: p?.excerpt ?? "",
    content: p?.content ?? "",
    coverImage: p?.coverImage ?? "/blog/adaptogens.svg",
    category: p?.category ?? BLOG_CATEGORIES[0],
    author: p?.author ?? "OriginLife",
    readMinutes: p ? String(p.readMinutes) : "4",
    featured: p?.featured ?? false,
    published: p?.published ?? true,
  };
}

/** Rough reading-time estimate at ~200 words per minute. */
function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(post));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function field<K extends keyof FormState>(key: K) {
    return {
      value: form[key] as string,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json();

    if (res.ok) setForm((f) => ({ ...f, coverImage: data.url }));
    else setError(data.error || "Upload failed");

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      coverImage: form.coverImage.trim(),
      category: form.category,
      author: form.author.trim() || "OriginLife",
      readMinutes: parseInt(form.readMinutes || "4", 10),
      featured: form.featured,
      published: form.published,
    };

    const res = await fetch(post ? `/api/blog/${post.id}` : "/api/blog", {
      method: post ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save post");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setError("Could not delete post");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" {...field("title")} required />
        <TextField label="Slug" {...field("slug")} required placeholder="my-article-slug" />
      </div>

      <label className="block text-sm">
        <span className="text-ink-soft">Excerpt</span>
        <textarea
          {...field("excerpt")}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
        />
        <span className="mt-1 block text-xs text-ink-faint">
          Shown on the blog listing and article header.
        </span>
      </label>

      <label className="block text-sm">
        <span className="text-ink-soft">Article body</span>
        <textarea
          {...field("content")}
          rows={16}
          required
          className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 font-mono text-xs leading-relaxed outline-none transition focus:border-ink"
        />
        <span className="mt-1 block text-xs text-ink-faint">
          Leave a blank line between paragraphs. Start a line with{" "}
          <code className="rounded bg-line/60 px-1">## </code> to make it a subheading.
        </span>
      </label>

      <div>
        <span className="text-sm text-ink-soft">Cover image</span>
        <div className="mt-1.5 flex items-center gap-4">
          {form.coverImage && (
            <div className="h-16 w-28 overflow-hidden rounded-lg border border-line bg-paper-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.coverImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink">
            {uploading ? "Uploading…" : form.coverImage ? "Replace image" : "Upload image"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <TextField label="Or image path/URL" {...field("coverImage")} className="mt-3" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-ink-soft">Category</span>
          <select
            {...field("category")}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
          >
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Author" {...field("author")} />
        <div>
          <TextField label="Read time (min)" type="number" {...field("readMinutes")} />
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, readMinutes: String(estimateReadMinutes(f.content)) }))
            }
            className="mt-1 text-xs text-ink-faint underline underline-offset-4 hover:text-ink"
          >
            Estimate from body
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Published (visible on the site)
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className={buttonClass()}
        >
          {saving ? "Saving…" : post ? "Save changes" : "Publish post"}
        </button>
        {post && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-line px-6 py-3 text-sm text-red-700 transition hover:border-red-300 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function TextField({
  label,
  className = "",
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-ink-soft">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
      />
    </label>
  );
}
