import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

/** How long a reset link stays valid. */
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type ResetScope = "customer" | "admin";

/** Tokens are stored hashed — the raw value only ever exists in the email. */
function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Issue a reset token for an account and return the raw token (to be emailed).
 * Any outstanding tokens for that account are invalidated first, so an old
 * link can't be used after a new one is requested.
 */
export async function createResetToken(params: {
  scope: ResetScope;
  accountId: string;
}): Promise<string> {
  const { scope, accountId } = params;
  const owner = scope === "customer" ? { customerId: accountId } : { adminId: accountId };

  await prisma.passwordResetToken.deleteMany({ where: owner });

  const raw = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      ...owner,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return raw;
}

export type ResolvedToken = {
  id: string;
  scope: ResetScope;
  accountId: string;
};

/**
 * Look up a raw token and confirm it is unused and unexpired.
 * Returns null for anything invalid — callers should not distinguish between
 * "wrong token" and "expired token" in what they show the user.
 */
export async function resolveResetToken(raw: string): Promise<ResolvedToken | null> {
  if (!raw) return null;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(raw) },
  });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;

  if (record.customerId) {
    return { id: record.id, scope: "customer", accountId: record.customerId };
  }
  if (record.adminId) {
    return { id: record.id, scope: "admin", accountId: record.adminId };
  }
  return null;
}

export const PASSWORD_MIN_LENGTH = 8;
