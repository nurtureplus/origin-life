import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/auth";
import { normalizePhone, looksLikeEmail } from "@/lib/phone";
import { readJsonBody, badRequest } from "@/lib/request";

export async function POST(req: NextRequest) {
  const body = await readJsonBody(req);
  if (!body) return badRequest();
  // `identifier` is the mobile number or email. `email` is still accepted so
  // older clients keep working.
  const identifier: string = (body.identifier ?? body.email ?? "").trim();
  const password: string = body.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Mobile number or email and password are required" },
      { status: 400 }
    );
  }

  const customer = looksLikeEmail(identifier)
    ? await prisma.customer.findUnique({ where: { email: identifier.toLowerCase() } })
    : await prisma.customer.findUnique({ where: { phone: normalizePhone(identifier) } });

  // Same message either way so the endpoint can't be used to enumerate accounts.
  const invalid = NextResponse.json(
    { error: "Invalid mobile number/email or password" },
    { status: 401 }
  );
  if (!customer) return invalid;

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return invalid;

  const token = await createCustomerSessionToken({
    sub: customer.id,
    email: customer.email,
    name: customer.name,
  });

  const res = NextResponse.json({ ok: true, name: customer.name, email: customer.email });
  res.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
