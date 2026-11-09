import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken, verifyAdminPassword } from "@/lib/admin-auth";
import { cookieSecure, getSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "");
  const password = String(body?.password || "");
  const admin = await verifyAdminPassword(email, password);
  if (!admin) return NextResponse.json({ error: "Email or password did not match." }, { status: 401 });
  const token = await createAdminToken(admin.id, admin.email);
  const settings = await getSettings();
  const res = NextResponse.json({ ok: true, email: admin.email });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(settings),
    path: "/",
    maxAge: settings.adminSessionDays * 60 * 60 * 24,
  });
  return res;
}
