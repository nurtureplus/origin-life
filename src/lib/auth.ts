import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SESSION_COOKIE = "originlife_admin_session";
const CUSTOMER_SESSION_COOKIE = "originlife_customer_session";
const alg = "HS256";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export type AdminSession = SessionPayload;

export async function createSessionToken(payload: AdminSession) {
  return signSession(payload);
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  return verifySession(token);
}

export async function requireAdminSession(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export type CustomerSession = SessionPayload;

export async function createCustomerSessionToken(payload: CustomerSession) {
  return signSession(payload);
}

export async function verifyCustomerSessionToken(token: string): Promise<CustomerSession | null> {
  return verifySession(token);
}

export async function requireCustomerSession(req: NextRequest): Promise<CustomerSession | null> {
  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerSessionToken(token);
}

export { SESSION_COOKIE, CUSTOMER_SESSION_COOKIE };
