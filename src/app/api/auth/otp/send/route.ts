import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateOtp, hashOtp } from "@/lib/auth";
import { otpMessage, sendWhatsAppText } from "@/lib/whatsapp";
import { isValidIndianMobile, normalizePhone } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

const bodySchema = z.object({ phone: z.string().min(10) });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a mobile number." }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!isValidIndianMobile(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile." }, { status: 400 });
  }

  const settings = await getSettings();
  const cooldownMs = 60_000;
  const justSent = await prisma.otpChallenge.findFirst({
    where: { phone, createdAt: { gte: new Date(Date.now() - cooldownMs) } },
    orderBy: { createdAt: "desc" },
  });
  if (justSent) {
    return NextResponse.json({ ok: true });
  }

  const recent = await prisma.otpChallenge.count({
    where: { phone, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= settings.otpPerHour) {
    return NextResponse.json({ error: "Too many codes. Try again in an hour." }, { status: 429 });
  }

  const code = generateOtp();
  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashOtp(phone, code),
      expiresAt: new Date(Date.now() + settings.otpExpiryMinutes * 60 * 1000),
    },
  });

  const sent = await sendWhatsAppText(phone, otpMessage(code, settings.otpExpiryMinutes));
  const previewAllowed = settings.allowOtpPreview && process.env.NODE_ENV !== "production";
  if (!sent.ok) {
    if (!previewAllowed) {
      const missing = /not configured/i.test(sent.error);
      return NextResponse.json(
        {
          error: missing
            ? "WhatsApp OTP is not linked yet. Add Client ID and API key in the server .env, then restart the app."
            : "WhatsApp did not accept the keys. Copy Client ID and API key exactly from Turnkey, then restart the app.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      preview: code,
      warning: sent.error,
    });
  }

  return NextResponse.json({ ok: true });
}
