import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { deliveryFeeFor, isValidIndianMobile, normalizePhone } from "@/lib/utils";
import { commissionOn, effectiveCommissionPercent } from "@/lib/commission";
import { distanceMatrix } from "@/lib/google-maps";
import { getSettings } from "@/lib/settings";
import {
  GUEST_ORDER_COOKIE,
  guestOrderCookieOptions,
  readGuestOrderIds,
  signGuestOrderIds,
} from "@/lib/guest-order";

const bodySchema = z.object({
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })).min(1),
  address: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    line1: z.string().min(3),
    landmark: z.string().optional(),
    city: z.string().min(2),
    pincode: z.string().min(6),
  }),
  origin: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  const settings = await getSettings();
  if (!user && settings.guestCheckout === false) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check address and cart." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.address.phone);
  if (!isValidIndianMobile(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  const ids = parsed.data.items.map((line) => line.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    include: { seller: { include: { sellerCategory: true } } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = parsed.data.items
    .map((line) => {
      const product = byId.get(line.id);
      if (!product) return null;
      const percent = effectiveCommissionPercent({
        productPercent: product.commissionPercent,
        sellerPercent: product.seller.commissionPercent,
        categoryPercent: product.seller.sellerCategory.commissionPercent,
      });
      const gross = product.price * line.qty;
      return {
        product,
        qty: line.qty,
        percent,
        commissionAmount: commissionOn(gross, percent),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (!lines.length) {
    return NextResponse.json({ error: "Cart items are no longer available." }, { status: 400 });
  }

  const account =
    user ??
    (await prisma.user.upsert({
      where: { phone },
      create: { phone, name: parsed.data.address.name.trim() },
      update: { name: parsed.data.address.name.trim() },
    }));

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
  const deliveryFee = deliveryFeeFor(subtotal, settings.freeDeliveryOver, settings.deliveryFee);
  const total = subtotal + deliveryFee;
  const hasService = lines.some((line) => line.product.kind === "service");
  let etaMinutes = Math.max(...lines.map((line) => line.product.etaMinutes), 15);
  if (parsed.data.origin) {
    const dests = lines
      .filter((line) => line.product.seller.lat != null && line.product.seller.lng != null)
      .map((line) => ({
        id: line.product.id,
        lat: line.product.seller.lat as number,
        lng: line.product.seller.lng as number,
      }));
    if (dests.length) {
      const matrix = await distanceMatrix(parsed.data.origin, dests);
      etaMinutes = Math.max(...matrix.map((row) => row.minutes), 6);
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: account.id,
      status: "pending",
      fulfillment: hasService ? "service" : "delivery",
      subtotal,
      deliveryFee,
      total,
      etaMinutes,
      addressJson: JSON.stringify({ ...parsed.data.address, phone }),
      items: {
        create: lines.map((line) => ({
          productId: line.product.id,
          sellerId: line.product.sellerId,
          name: line.product.name,
          qty: line.qty,
          price: line.product.price,
          image: line.product.image,
          kind: line.product.kind,
          commissionPercent: line.percent,
          commissionAmount: line.commissionAmount,
        })),
      },
    },
  });

  try {
    const razorpay = await getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: order.id.slice(0, 40),
      notes: { zuknowOrderId: order.id },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });
    const res = NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      key: settings.razorpayKeyId,
      guest: !user,
    });
    if (!user) {
      const idsSoFar = await readGuestOrderIds(request);
      const token = await signGuestOrderIds([...idsSoFar, order.id]);
      res.cookies.set(GUEST_ORDER_COOKIE, token, await guestOrderCookieOptions());
    }
    return res;
  } catch (error) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } });
    const message = error instanceof Error ? error.message : "Razorpay error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
