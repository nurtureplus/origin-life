/**
 * Phone numbers are the primary login identifier, so they must normalise to a
 * single canonical form — otherwise "+91 90326 23903" and "9032623903" would
 * create two accounts for one person and break login.
 */

/** Strip formatting and the +91 country code down to a bare 10-digit number. */
export function normalizePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  // Handle 0-prefixed and +91/91-prefixed Indian numbers.
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** Indian mobile numbers: 10 digits, first digit 6-9. */
export function isValidPhone(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(input));
}

/** True when the string looks like an email rather than a phone number. */
export function looksLikeEmail(input: string): boolean {
  return input.includes("@");
}

/**
 * Server-side email sanity check. `type="email"` in the browser is a hint, not a
 * guarantee — anything posting straight to the API bypasses it, and a customer
 * who registers with an unreachable address can never receive a password reset.
 */
export function isValidEmail(input: string): boolean {
  const value = (input || "").trim();
  if (value.length < 3 || value.length > 254) return false;
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

export function formatPhone(phone: string): string {
  const p = normalizePhone(phone);
  return p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : phone;
}
