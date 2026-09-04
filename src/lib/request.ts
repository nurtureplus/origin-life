import { NextRequest, NextResponse } from "next/server";

/**
 * Parses a JSON request body without letting a malformed one escape as a 500.
 *
 * `req.json()` throws on invalid JSON, and an unhandled throw in a route
 * handler becomes an Internal Server Error — so a client sending junk got a
 * stack trace and a 500 where the honest answer is "your request was bad".
 *
 * Returns `null` on unparseable input; callers reply with `badRequest()`.
 */
/**
 * A decoded JSON object. Individual fields stay loosely typed because every
 * route validates the ones it needs itself; callers that want stronger typing
 * pass an explicit generic.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonBody = Record<string, any>;

export async function readJsonBody<T = JsonBody>(req: NextRequest): Promise<T | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as T) : null;
  } catch {
    return null;
  }
}

export function badRequest(message = "Invalid request body") {
  return NextResponse.json({ error: message }, { status: 400 });
}
