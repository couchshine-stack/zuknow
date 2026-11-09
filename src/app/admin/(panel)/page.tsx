import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { orderNumber, statusLabel } from "@/lib/orders";

export default async function AdminHomePage() {
  const [products, sellers, orders, commissions, recentOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.seller.count(),
    prisma.order.count({ where: { status: { in: ["paid", "accepted", "packing", "out"] } } }),
    prisma.commission.aggregate({ _sum: { commissionAmount: true, sellerEarning: true } }),
    prisma.order.findMany({
      where: { status: { not: "pending" } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true },
    }),
  ]);

  const cards = [
    { label: "Live products", value: String(products), href: "/admin/products" },
    { label: "Sellers", value: String(sellers), href: "/admin/sellers" },
    { label: "Paid orders", value: String(orders), href: "/admin/orders" },
    { label: "Platform commission", value: formatInr(commissions._sum.commissionAmount || 0), href: "/admin/commission" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Dashboard</h1>
        <p className="text-zk-ink/60">Catalog, sellers and the 15-minute clock.</p>
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
        <h2 className="font-display text-lg font-bold text-zk-navy">Recent orders</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-zk-ink/50">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-t border-zk-line">
                <td className="py-2 font-mono text-xs">{orderNumber(order.id)}</td>
                <td>+91 {order.user.phone}</td>
                <td>{statusLabel(order.status)}</td>
                <td className="text-right font-semibold">{formatInr(order.total)}</td>
              </tr>
            ))}
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zk-ink/50">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
