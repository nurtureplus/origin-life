import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/auth";
import { normalizePhone, isValidPhone, isValidEmail } from "@/lib/phone";
import { readJsonBody, badRequest } from "@/lib/request";

export async function POST(req: NextRequest) {
  const parsed = await readJsonBody<{ name?: string; email?: string; password?: string; phone?: string }>(req);
  if (!parsed) return badRequest();
  const { name, email, password, phone } = parsed;

  if (!name || !email || !password || !phone) {
    return NextResponse.json(
      { error: "Name, mobile number, email, and password are required" },
      { status: 400 }
    );
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number" },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.customer.findFirst({
    where: { OR: [{ email: normalizedEmail }, { phone: normalizedPhone }] },
    select: { email: true, phone: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.phone === normalizedPhone
            ? "An account with this mobile number already exists"
            : "An account with this email already exists",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({
    data: { name: String(name).trim(), email: normalizedEmail, phone: normalizedPhone, passwordHash },
  });

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
