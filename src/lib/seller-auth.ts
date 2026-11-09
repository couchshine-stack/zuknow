import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { getSettings } from "./settings";
import { normalizePhone } from "./utils";

export const SELLER_COOKIE = "zk_seller";

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSellerToken(sellerId: string, phone: string) {
  const settings = await getSettings();
  return new SignJWT({ phone, role: "seller" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sellerId)
    .setIssuedAt()
    .setExpirationTime(`${Math.max(1, settings.adminSessionDays)}d`)
    .sign(authSecret());
}

export async function readSellerSession() {
  const jar = await cookies();
  const token = jar.get(SELLER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (payload.role !== "seller" || !payload.sub) return null;
    return { sellerId: payload.sub, phone: String(payload.phone || "") };
  } catch {
    return null;
  }
}

export async function getSellerUser() {
  const session = await readSellerSession();
  if (!session) return null;
  return prisma.seller.findUnique({
    where: { id: session.sellerId },
    include: { sellerCategory: true },
  });
}

export async function verifySellerLogin(identifier: string, password: string) {
  const raw = identifier.trim();
  const phone = normalizePhone(raw);
  const email = raw.toLowerCase();
  const seller = await prisma.seller.findFirst({
    where: {
      OR: [{ phone }, { phone: raw }, { email }],
    },
  });
  if (!seller?.passwordHash) return { ok: false as const, error: "Phone/email or password did not match." };
  const ok = await bcrypt.compare(password, seller.passwordHash);
  if (!ok) return { ok: false as const, error: "Phone/email or password did not match." };
  if (seller.status === "suspended") {
    return { ok: false as const, error: "This shop is paused. Call zuknow support." };
  }
  return { ok: true as const, seller };
}

