import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { orderNumber } from "@/lib/orders";
import { getSellerUser } from "@/lib/seller-auth";
import { SellerPasswordForm } from "@/components/seller/SellerPasswordForm";
import { redirect } from "next/navigation";

export default async function SellerHomePage() {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");

  const [live, hidden, paidItems, recent] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id, active: true } }),
    prisma.product.count({ where: { sellerId: seller.id, active: false } }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id, order: { status: "paid" } },
      select: { price: true, qty: true, commissionAmount: true },
    }),
    prisma.order.findMany({
      where: { items: { some: { sellerId: seller.id } }, status: { not: "pending" } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: true,
        items: { where: { sellerId: seller.id } },
      },
    }),
  ]);

  const sales = paidItems.reduce((sum, row) => sum + row.price * row.qty, 0);
  const yours = paidItems.reduce((sum, row) => sum + row.price * row.qty - row.commissionAmount, 0);

  const cards = [
    { label: "Live products", value: String(live), href: "/seller/products" },
    { label: "Hidden", value: String(hidden), href: "/seller/products" },
    { label: "Paid sales", value: formatInr(sales), href: "/seller/orders" },
    { label: "Your earnings", value: formatInr(yours), href: "/seller/orders" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">{seller.shopName}</h1>
        <p className="text-zk-ink/60">
          {seller.ownerName} · +91 {seller.phone} · {seller.city || "Amravati"}
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zk-line">
            <p className="text-xs font-semibold uppercase tracking-wide text-zk-ink/50">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-zk-navy">{card.value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
        <h2 className="font-display text-lg font-bold text-zk-navy">Recent orders for your shop</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-zk-ink/50">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th className="text-right">Your lines</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((order) => (
              <tr key={order.id} className="border-t border-zk-line">
                <td className="py-2 font-mono text-xs">{orderNumber(order.id)}</td>
                <td>+91 {order.user.phone}</td>
                <td>{order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                <td className="text-right font-semibold">
                  {formatInr(order.items.reduce((sum, i) => sum + i.price * i.qty, 0))}
                </td>
              </tr>
            ))}
            {recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zk-ink/50">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
      <SellerPasswordForm />
    </div>
  );
}
