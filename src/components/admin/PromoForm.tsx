"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Promo } from "@prisma/client";
import { buttonClass } from "@/lib/button";

type FormState = {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  order: string;
  active: boolean;
};

function toFormState(p?: Promo): FormState {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    subtitle: p?.subtitle ?? "",
    image: p?.image ?? "",
    badge: p?.badge ?? "",
    ctaLabel: p?.ctaLabel ?? "",
    ctaHref: p?.ctaHref ?? "",
    order: p ? String(p.order) : "0",
    active: p?.active ?? true,
  };
}

export function PromoForm({ promo }: { promo?: Promo }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(promo));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function field<K extends keyof FormState>(key: K) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
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

    if (res.ok) {
      setForm((f) => ({ ...f, image: data.url }));
    } else {
      setError(data.error || "Upload failed");
    }
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
      subtitle: form.subtitle.trim() || null,
      image: form.image.trim(),
      badge: form.badge.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      ctaHref: form.ctaHref.trim() || null,
      order: parseInt(form.order || "0", 10),
      active: form.active,
    };

    if (!payload.image) {
      setError("Please provide a background image (upload one below).");
      setSaving(false);
      return;
    }

    const res = await fetch(promo ? `/api/promos/${promo.id}` : "/api/promos", {
      method: promo ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/promos");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save promo slide");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!promo) return;
    if (!confirm(`Delete "${promo.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/promos/${promo.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/promos");
      router.refresh();
    } else {
      setError("Could not delete promo slide");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" {...field("title")} required />
        <TextField label="Slug" {...field("slug")} required />
      </div>

      <TextField label="Subtitle" {...field("subtitle")} />

      <div>
        <span className="text-sm text-ink-soft">Colour wash</span>
        <p className="mt-0.5 text-xs text-ink-faint">
          Shown as a soft tint behind this slide in the hero.
        </p>
        <div className="mt-1.5 flex items-center gap-4">
          {form.image && (
            <div className="h-16 w-28 overflow-hidden rounded-lg border border-line bg-paper-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink">
            {uploading ? "Uploading…" : form.image ? "Replace image" : "Upload image"}
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
        <TextField
          label="Or image path/URL"
          {...field("image")}
          className="mt-3"
          placeholder="/promos/promo-green.svg"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Badge (optional)" {...field("badge")} placeholder="New release" />
        <TextField label="Order" type="number" {...field("order")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="CTA label" {...field("ctaLabel")} placeholder="Shop now" />
        <TextField label="CTA link" {...field("ctaHref")} placeholder="/products" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
        />
        Active (visible on homepage)
      </label>

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
          {saving ? "Saving…" : promo ? "Save changes" : "Create hero slide"}
        </button>
        {promo && (
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
