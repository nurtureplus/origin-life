"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductDTO } from "@/lib/format";
import { buttonClass } from "@/lib/button";

const CATEGORIES = ["Energy", "Sleep", "Focus", "Recovery", "Beauty", "Foundations"];

type FormState = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string;
  ingredients: string;
  priceCents: string;
  compareAtCents: string;
  category: string;
  badge: string;
  image: string;
  stock: string;
  featured: boolean;
  active: boolean;
  servingSize: string;
  servingsPerPack: string;
  nutritionFacts: string;
  directions: string;
  warnings: string;
  allergens: string;
  storage: string;
  manufacturer: string;
  fssaiLicense: string;
  countryOfOrigin: string;
  shelfLifeMonths: string;
};

/**
 * The nutrition table is edited as `Nutrient | Amount` lines and stored as JSON.
 * A two-column table is the only structured field on the form, and a pair of
 * text lines is far quicker to fill in than a repeatable row widget.
 */
function nutritionToText(raw: string | null): string {
  if (!raw) return "";
  try {
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) return "";
    return rows.map((r) => `${r.label} | ${r.amount ?? ""}`).join("\n");
  } catch {
    return "";
  }
}

function nutritionToJson(text: string): string | null {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: label.trim(), amount: rest.join("|").trim() };
    })
    .filter((row) => row.label);
  return rows.length > 0 ? JSON.stringify(rows) : null;
}

function toFormState(p?: ProductDTO): FormState {
  return {
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    tagline: p?.tagline ?? "",
    description: p?.description ?? "",
    benefits: p?.benefits.join("\n") ?? "",
    ingredients: p?.ingredients.join("\n") ?? "",
    priceCents: p ? String(p.priceCents / 100) : "",
    compareAtCents: p?.compareAtCents ? String(p.compareAtCents / 100) : "",
    category: p?.category ?? CATEGORIES[0],
    badge: p?.badge ?? "",
    image: p?.image ?? "/products/core.svg",
    stock: p ? String(p.stock) : "100",
    featured: p?.featured ?? false,
    active: p?.active ?? true,
    servingSize: p?.servingSize ?? "",
    servingsPerPack: p?.servingsPerPack ? String(p.servingsPerPack) : "",
    nutritionFacts: nutritionToText(p?.nutritionFacts ?? null),
    directions: p?.directions ?? "",
    warnings: p?.warnings ?? "",
    allergens: p?.allergens ?? "",
    storage: p?.storage ?? "",
    manufacturer: p?.manufacturer ?? "",
    fssaiLicense: p?.fssaiLicense ?? "",
    countryOfOrigin: p?.countryOfOrigin ?? "India",
    shelfLifeMonths: p?.shelfLifeMonths ? String(p.shelfLifeMonths) : "",
  };
}

export function ProductForm({ product }: { product?: ProductDTO }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof FormState>(key: K) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      benefits: form.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
      ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      priceCents: Math.round(parseFloat(form.priceCents || "0") * 100),
      compareAtCents: form.compareAtCents ? Math.round(parseFloat(form.compareAtCents) * 100) : null,
      category: form.category,
      badge: form.badge.trim() || null,
      image: form.image.trim(),
      stock: parseInt(form.stock || "0", 10),
      featured: form.featured,
      active: form.active,
      // Empty strings become null so the product page can tell "not filled in"
      // apart from "deliberately blank" and render "Not provided".
      servingSize: form.servingSize.trim() || null,
      servingsPerPack: form.servingsPerPack ? parseInt(form.servingsPerPack, 10) : null,
      nutritionFacts: nutritionToJson(form.nutritionFacts),
      directions: form.directions.trim() || null,
      warnings: form.warnings.trim() || null,
      allergens: form.allergens.trim() || null,
      storage: form.storage.trim() || null,
      manufacturer: form.manufacturer.trim() || null,
      fssaiLicense: form.fssaiLicense.trim() || null,
      countryOfOrigin: form.countryOfOrigin.trim() || null,
      shelfLifeMonths: form.shelfLifeMonths ? parseInt(form.shelfLifeMonths, 10) : null,
    };

    const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save product");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError("Could not delete product");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" {...field("name")} required />
        <TextField label="Slug" {...field("slug")} required />
      </div>

      <TextField label="Tagline" {...field("tagline")} required />

      <label className="block text-sm">
        <span className="text-ink-soft">Description</span>
        <textarea
          {...field("description")}
          required
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink-soft">Benefits (one per line)</span>
          <textarea
            {...field("benefits")}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-soft">Ingredients (one per line)</span>
          <textarea
            {...field("ingredients")}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Price (₹)" type="number" step="0.01" {...field("priceCents")} required />
        <TextField label="Compare-at price (₹)" type="number" step="0.01" {...field("compareAtCents")} />
        <TextField label="Stock" type="number" {...field("stock")} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-ink-soft">Category</span>
          <select
            {...field("category")}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Badge (optional)" {...field("badge")} />
        <TextField label="Image path" {...field("image")} />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Active (visible in store)
        </label>
      </div>

      <fieldset className="space-y-4 border-t border-line pt-6">
        <legend className="sr-only">Label and compliance</legend>
        <div>
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Label &amp; compliance
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            This block appears on the product page under Supplement facts. Anything left blank
            shows there as &ldquo;Not provided&rdquo; — fill it in before the product goes live.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Serving size" placeholder="2 capsules" {...field("servingSize")} />
          <TextField label="Servings per pack" type="number" {...field("servingsPerPack")} />
          <TextField label="Shelf life (months)" type="number" {...field("shelfLifeMonths")} />
        </div>

        <label className="block text-sm">
          <span className="text-ink-soft">
            Nutritional information (one per line, &ldquo;Nutrient | Amount&rdquo;)
          </span>
          <textarea
            {...field("nutritionFacts")}
            rows={5}
            placeholder={"Vitamin D3 | 1000 IU\nMagnesium glycinate | 400 mg"}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 font-mono text-xs outline-none transition focus:border-ink"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-ink-soft">Directions for use</span>
            <textarea
              {...field("directions")}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-soft">Warnings &amp; precautions</span>
            <textarea
              {...field("warnings")}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Allergen information" {...field("allergens")} />
          <TextField label="Storage" {...field("storage")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Manufactured by" {...field("manufacturer")} />
          <TextField label="FSSAI licence" {...field("fssaiLicense")} />
          <TextField label="Country of origin" {...field("countryOfOrigin")} />
        </div>
      </fieldset>

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
          {saving ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        {product && (
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
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-ink-soft">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-line bg-paper-soft px-4 py-2.5 outline-none transition focus:border-ink"
      />
    </label>
  );
}
