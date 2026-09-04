"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Reel } from "@prisma/client";
import { buttonClass } from "@/lib/button";

type FormState = {
  title: string;
  videoUrl: string;
  thumbnail: string;
  instagramUrl: string;
  order: string;
  active: boolean;
};

function toFormState(r?: Reel): FormState {
  return {
    title: r?.title ?? "",
    videoUrl: r?.videoUrl ?? "",
    thumbnail: r?.thumbnail ?? "",
    instagramUrl: r?.instagramUrl ?? "",
    order: r ? String(r.order) : "0",
    active: r?.active ?? true,
  };
}

export function ReelForm({ reel }: { reel?: Reel }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(reel));
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  function field<K extends keyof FormState>(key: K) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function upload(file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return null;
    }
    return data.url as string;
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setError(null);
    const url = await upload(file);
    if (url) setForm((f) => ({ ...f, videoUrl: url }));
    setUploadingVideo(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    setError(null);
    const url = await upload(file);
    if (url) setForm((f) => ({ ...f, thumbnail: url }));
    setUploadingThumb(false);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      videoUrl: form.videoUrl.trim(),
      thumbnail: form.thumbnail.trim() || null,
      instagramUrl: form.instagramUrl.trim() || null,
      order: parseInt(form.order || "0", 10),
      active: form.active,
    };

    if (!payload.videoUrl) {
      setError("Please upload a video or paste a video URL.");
      setSaving(false);
      return;
    }

    const res = await fetch(reel ? `/api/reels/${reel.id}` : "/api/reels", {
      method: reel ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/reels");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save reel");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!reel) return;
    if (!confirm(`Delete "${reel.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/reels/${reel.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/reels");
      router.refresh();
    } else {
      setError("Could not delete reel");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <TextField label="Title / caption" {...field("title")} required />

      <div>
        <span className="text-sm text-ink-soft">Video</span>
        <div className="mt-1.5 flex items-center gap-4">
          {form.videoUrl && (
            <video
              src={form.videoUrl}
              className="h-28 w-16 rounded-lg border border-line bg-dark object-cover"
              muted
            />
          )}
          <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink">
            {uploadingVideo ? "Uploading…" : form.videoUrl ? "Replace video" : "Upload video"}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={uploadingVideo}
            />
          </label>
        </div>
        <TextField
          label="Or video URL"
          {...field("videoUrl")}
          className="mt-3"
          placeholder="https://…/reel.mp4"
        />
        <p className="mt-1 text-xs text-ink-faint">MP4, WebM, or MOV. Max 80MB.</p>
      </div>

      <div>
        <span className="text-sm text-ink-soft">Thumbnail (optional)</span>
        <div className="mt-1.5 flex items-center gap-4">
          {form.thumbnail && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={form.thumbnail}
              alt=""
              className="h-16 w-16 rounded-lg border border-line object-cover"
            />
          )}
          <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink">
            {uploadingThumb ? "Uploading…" : "Upload thumbnail"}
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbUpload}
              className="hidden"
              disabled={uploadingThumb}
            />
          </label>
        </div>
      </div>

      <TextField
        label="Instagram post URL (optional)"
        {...field("instagramUrl")}
        placeholder="https://instagram.com/reel/…"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Order" type="number" {...field("order")} />
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Active (visible on homepage)
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
          {saving ? "Saving…" : reel ? "Save changes" : "Add reel"}
        </button>
        {reel && (
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
