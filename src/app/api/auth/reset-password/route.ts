import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resolveResetToken, PASSWORD_MIN_LENGTH } from "@/lib/password-reset";
import { CUSTOMER_SESSION_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { readJsonBody, badRequest } from "@/lib/request";

/** GET — lets the reset page tell a valid link from an expired one up front. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const resolved = await resolveResetToken(token);
  return NextResponse.json({ valid: Boolean(resolved), scope: resolved?.scope ?? null });
}

export async function POST(req: NextRequest) {
  const body = await readJsonBody<{ token?: string; password?: string }>(req);
  if (!body) return badRequest();
  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
  }
  if (String(password).length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` },
      { status: 400 }
    );
  }

  const resolved = await resolveResetToken(token);
  if (!resolved) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Update the password and burn the token together, so a crash can't leave a
  // reusable link behind a successful change.
  await prisma.$transaction(async (tx) => {
    if (resolved.scope === "customer") {
      await tx.customer.update({
        where: { id: resolved.accountId },
        data: { passwordHash },
      });
    } else {
      await tx.adminUser.update({
        where: { id: resolved.accountId },
        data: { passwordHash },
      });
    }
    await tx.passwordResetToken.update({
      where: { id: resolved.id },
      data: { usedAt: new Date() },
    });
  });

  const res = NextResponse.json({ ok: true, scope: resolved.scope });
  // Drop any existing session so the new password must be used to sign in.
  res.cookies.delete(resolved.scope === "customer" ? CUSTOMER_SESSION_COOKIE : SESSION_COOKIE);
  return res;
}
