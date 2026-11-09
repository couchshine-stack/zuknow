import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const app = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((row) => row.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const allowed = new Set([app, "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", ...extra]);
  const ok = !origin || allowed.has(origin.replace(/\/$/, ""));
  return {
    "Access-Control-Allow-Origin": origin && ok ? origin : app || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
  }

  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = request.cookies.get("zk_admin")?.value;
    if (!token || !process.env.AUTH_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (path.startsWith("/seller") && path !== "/seller/login") {
    const token = request.cookies.get("zk_seller")?.value;
    if (!token || !process.env.AUTH_SECRET) {
      return NextResponse.redirect(new URL("/seller/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      if (payload.role !== "seller") {
        return NextResponse.redirect(new URL("/seller/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/seller/login", request.url));
    }
  }

  const res = NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const headers = corsHeaders(request);
    for (const [key, value] of Object.entries(headers)) res.headers.set(key, value);
  }
  return res;
}

export const config = { matcher: ["/api/:path*", "/admin", "/admin/:path*", "/seller", "/seller/:path*"] };
