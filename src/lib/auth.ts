import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { getSettings } from "./settings";

export const SESSION_COOKIE = "zk_session";

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export function hashOtp(phone: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret)
    .update(`${phone}:${code}`)
    .digest("hex");
}

export function generateOtp() {
  return String(randomInt(100000, 1000000));
}

export async function createSessionToken(userId: string, phone: string) {
  const settings = await getSettings();
  return new SignJWT({ phone })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, settings.customerSessionDays)}d`)
    .sign(authSecret());
}

export async function parseToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (!payload.sub) return null;
    return { userId: payload.sub, phone: String(payload.phone || "") };
  } catch {
    return null;
  }
}

export async function readSession(request?: Request) {
  const header = request?.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (bearer) return parseToken(bearer);
  const jar = await cookies();
  return parseToken(jar.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser(request?: Request) {
  const session = await readSession(request);
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { addresses: true },
  });
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
