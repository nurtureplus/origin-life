/**
 * Sanitises a `?next=` redirect target.
 *
 * The value arrives from the URL, so an attacker can put anything in it. Handing
 * it straight to `router.push` turns our own login page into an open redirect:
 * a link to the genuine site that bounces the user to an attacker's lookalike
 * *after* they have signed in successfully.
 *
 * Only same-origin absolute paths are allowed through, and callers may require
 * a prefix so an admin login can't be used to land somewhere unrelated.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string,
  requiredPrefix?: string
): string {
  if (!next) return fallback;

  // Must be an absolute path on this origin. Anything with a scheme
  // ("https://evil.com", "javascript:...") or protocol-relative ("//evil.com")
  // is rejected. Backslashes are rejected too — some browsers normalise "/\" to
  // "//", which would smuggle a host past a naive check.
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.includes("\\")) return fallback;

  if (requiredPrefix && !(next === requiredPrefix || next.startsWith(requiredPrefix + "/"))) {
    return fallback;
  }

  return next;
}
