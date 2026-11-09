import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cookieSecure, getSettings } from "./settings";

export const GUEST_ORDER_COOKIE = "zk_guest_orders";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function parseGuestOrderIds(token: string | undefined | null): Promise<string[]> {
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, secret());
    const ids = payload.ids;
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function readGuestOrderIds(request?: Request): Promise<string[]> {
  if (request) {
    const raw = request.headers.get("cookie") || "";
    const match = raw.match(/(?:^|; )zk_guest_orders=([^;]*)/);
    return parseGuestOrderIds(match ? decodeURIComponent(match[1]) : null);
  }
  const jar = await cookies();
  return parseGuestOrderIds(jar.get(GUEST_ORDER_COOKIE)?.value);
}

export async function signGuestOrderIds(ids: string[]) {
  const unique = [...new Set(ids)].slice(-20);
  return new SignJWT({ ids: unique })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function guestOrderCookieOptions() {
  const settings = await getSettings();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(settings),
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
