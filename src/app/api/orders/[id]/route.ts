import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readGuestOrderIds } from "@/lib/guest-order";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  const { id } = await params;
  const guestIds = await readGuestOrderIds(request);
  const order = await prisma.order.findFirst({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const allowed = (user && order.userId === user.id) || guestIds.includes(id);
  if (!allowed) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
