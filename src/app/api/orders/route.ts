import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: { not: "pending" } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      etaMinutes: order.etaMinutes,
      createdAt: order.createdAt,
    })),
  });
}
