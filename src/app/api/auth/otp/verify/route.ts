import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionToken, hashOtp, SESSION_COOKIE, safeEqual } from "@/lib/auth";
import { isValidIndianMobile, normalizePhone } from "@/lib/utils";
import { cookieSecure, getSettings } from "@/lib/settings";

const bodySchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!isValidIndianMobile(phone)) {
    return NextResponse.json({ error: "Invalid phone." }, { status: 400 });
  }

  const settings = await getSettings();
  const challenges = await prisma.otpChallenge.findMany({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  if (!challenges.length) {
    return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
  }
  const latest = challenges[0];
  if (latest.attempts >= settings.otpMaxAttempts) {
    return NextResponse.json({ error: "Too many tries. Request a new code." }, { status: 400 });
  }

  const expected = hashOtp(phone, parsed.data.code);
  const challenge = challenges.find((row) => safeEqual(expected, row.codeHash));
  if (!challenge) {
    await prisma.otpChallenge.update({
      where: { id: latest.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "That code did not match." }, { status: 400 });
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumed: true },
  });

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });
  const token = await createSessionToken(user.id, user.phone);
  const res = NextResponse.json({
    ok: true,
    token,
    user: { id: user.id, phone: user.phone, name: user.name, email: user.email },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(settings),
    path: "/",
    maxAge: settings.customerSessionDays * 60 * 60 * 24,
  });
  return res;
}
