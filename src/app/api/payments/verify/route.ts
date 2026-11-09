import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { accrueCommissions } from "@/lib/commission";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getSettings } from "@/lib/settings";
import { readGuestOrderIds } from "@/lib/guest-order";
import { notifyAdminOnNewOrder, notifyCustomerOnNewOrder } from "@/lib/whatsapp";

const bodySchema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  const settings = await getSettings();
  const guestIds = await readGuestOrderIds(request);

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  const ok = await verifyRazorpaySignature(
    parsed.data.razorpay_order_id,
    parsed.data.razorpay_payment_id,
    parsed.data.razorpay_signature,
  );
  if (!ok) {
    return NextResponse.json({ error: "Signature mismatch." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, razorpayOrderId: parsed.data.razorpay_order_id },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const owns = Boolean(user && order.userId === user.id);
  const guestOk = settings.guestCheckout !== false && guestIds.includes(order.id);
  if (!owns && !guestOk) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
    },
  });
  await accrueCommissions(order.id);

  // Send Turnkey WhatsApp notification to admin & customer
  notifyAdminOnNewOrder(order.id).catch((err) => console.error("[Turnkey WhatsApp] Admin notify failed:", err));
  notifyCustomerOnNewOrder(order.id).catch((err) => console.error("[Turnkey WhatsApp] Customer notify failed:", err));

  return NextResponse.json({ ok: true, orderId: order.id });
}
