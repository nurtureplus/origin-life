import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken, type ResetScope } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { normalizePhone, looksLikeEmail } from "@/lib/phone";
import { readJsonBody, badRequest } from "@/lib/request";

export async function POST(req: NextRequest) {
  const body = await readJsonBody(req);
  if (!body) return badRequest();
  const identifier: string = (body.identifier ?? "").trim();
  const scope: ResetScope = body.scope === "admin" ? "admin" : "customer";

  if (!identifier) {
    return NextResponse.json({ error: "Enter your mobile number or email" }, { status: 400 });
  }

  // Always answer the same way, whether or not the account exists — otherwise
  // this endpoint becomes a way to discover which numbers/emails are registered.
  const genericResponse: Record<string, unknown> = {
    ok: true,
    message: "If that account exists, we've sent a reset link to its email address.",
  };

  let account: { id: string; email: string; name: string } | null = null;

  if (scope === "admin") {
    account = await prisma.adminUser.findUnique({
      where: { email: identifier.toLowerCase() },
      select: { id: true, email: true, name: true },
    });
  } else {
    account = looksLikeEmail(identifier)
      ? await prisma.customer.findUnique({
          where: { email: identifier.toLowerCase() },
          select: { id: true, email: true, name: true },
        })
      : await prisma.customer.findUnique({
          where: { phone: normalizePhone(identifier) },
          select: { id: true, email: true, name: true },
        });
  }

  if (!account) return NextResponse.json(genericResponse);

  const token = await createResetToken({ scope, accountId: account.id });
  const origin = req.nextUrl.origin;
  const resetUrl = `${origin}/account/reset-password?token=${token}`;

  try {
    const result = await sendPasswordResetEmail({
      to: account.email,
      name: account.name.split(" ")[0],
      resetUrl,
    });

    // Only ever surfaced outside production, and only when no mail provider
    // is configured — lets the flow be tested locally without leaking links.
    if (result.devPreviewUrl) {
      genericResponse.devPreviewUrl = result.devPreviewUrl;
      genericResponse.message =
        "Email isn't configured yet, so use the link below to reset your password.";
    }
  } catch (e) {
    console.error("[forgot-password] Failed to send reset email:", e);
    // Still generic — don't confirm the account exists via an error either.
  }

  return NextResponse.json(genericResponse);
}
