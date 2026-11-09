import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { getSettings } from "./settings";

export const ADMIN_COOKIE = "zk_admin";

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(adminId: string, email: string) {
  const settings = await getSettings();
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, settings.adminSessionDays)}d`)
    .sign(authSecret());
}

export async function readAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (payload.role !== "admin" || !payload.sub) return null;
    return { adminId: payload.sub, email: String(payload.email || "") };
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  const session = await readAdminSession();
  if (!session) return null;
  return prisma.adminUser.findUnique({ where: { id: session.adminId } });
}

export async function verifyAdminPassword(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? admin : null;
}
