import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseOrderNumber } from "@/lib/orders";
import { isValidIndianMobile, normalizePhone } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const suffix = parseOrderNumber(String(body?.number || ""));
  const phone = normalizePhone(String(body?.phone || ""));
  if (suffix.length < 6 || !isValidIndianMobile(phone)) {
    return NextResponse.json({ error: "Enter the order number and the phone used at checkout." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: { endsWith: suffix.toLowerCase() },
      user: { phone },
      status: { not: "pending" },
    },
    include: { items: { select: { id: true, name: true, qty: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "No order matches that number and phone." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      total: order.total,
      etaMinutes: order.etaMinutes,
      items: order.items,
    },
  });
}
