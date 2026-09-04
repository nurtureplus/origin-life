import type { JsonBody } from "@/lib/request";

/** Label fields stored as free text. */
export const LABEL_TEXT_FIELDS = [
  "servingSize",
  "nutritionFacts",
  "directions",
  "warnings",
  "allergens",
  "storage",
  "manufacturer",
  "fssaiLicense",
  "countryOfOrigin",
] as const;

/** Label fields stored as whole numbers. */
export const LABEL_NUMBER_FIELDS = ["servingsPerPack", "shelfLifeMonths"] as const;

/**
 * Pulls the label block out of a request body.
 *
 * Shared by create and update so the two can't drift — a field added to one and
 * not the other silently stops saving, and nothing fails loudly enough to
 * notice until a product page shows "Not provided" for data that was entered.
 *
 * `mode: "create"` writes every field (absent ones become null); `"update"`
 * only writes the keys actually present, so a PATCH that omits the block leaves
 * it untouched.
 */
export function labelDataFrom(body: JsonBody, mode: "create" | "update") {
  const data: Record<string, string | number | null> = {};

  for (const key of LABEL_TEXT_FIELDS) {
    if (mode === "create" || body[key] !== undefined) {
      const value = body[key];
      data[key] = typeof value === "string" && value.trim() ? value.trim() : null;
    }
  }

  for (const key of LABEL_NUMBER_FIELDS) {
    if (mode === "create" || body[key] !== undefined) {
      const n = Number(body[key]);
      data[key] = Number.isFinite(n) && n > 0 ? Math.round(n) : null;
    }
  }

  return data;
}
