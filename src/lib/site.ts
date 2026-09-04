/**
 * Canonical origin for anything that has to be an absolute URL — sitemap
 * entries, canonical tags, Open Graph images, JSON-LD `@id`s.
 *
 * Relative URLs are fine inside the app but wrong in all of the above: a
 * sitemap of relative paths is rejected outright, and a canonical tag that
 * resolves to localhost tells Google the production page is a duplicate of
 * nothing. Set NEXT_PUBLIC_SITE_URL in the production environment; the
 * localhost fallback only keeps dev working.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "OriginLife";

export const SITE_DESCRIPTION =
  "Clinically dosed nutraceuticals for energy, sleep, focus, and recovery. Nurturing body, mind & soul.";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
