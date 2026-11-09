import { prisma } from "./db";

export function toPercent(value: unknown) {
  if (value == null) return null;
  return Number(value);
}

export function effectiveCommissionPercent(input: {
  productPercent: unknown;
  sellerPercent: unknown;
  categoryPercent: unknown;
}) {
  if (input.productPercent != null && input.productPercent !== "") {
    return Number(input.productPercent);
  }
  if (input.sellerPercent != null && input.sellerPercent !== "") {
    return Number(input.sellerPercent);
  }
  return Number(input.categoryPercent ?? 0);
}

export function commissionOn(rupees: number, percent: number) {
  return Math.round((rupees * percent) / 100);
}

export async function accrueCommissions(orderId: string) {
  const existing = await prisma.commission.count({ where: { orderId } });
  if (existing) return;
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (!item.sellerId) continue;
    const gross = item.price * item.qty;
    await prisma.commission.create({
      data: {
        orderId,
        sellerId: item.sellerId,
        orderItemId: item.id,
        gross,
        commissionPercent: item.commissionPercent,
        commissionAmount: item.commissionAmount,
        sellerEarning: gross - item.commissionAmount,
        status: "accrued",
      },
    });
  }
}
