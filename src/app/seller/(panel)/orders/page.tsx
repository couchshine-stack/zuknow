import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { getSellerUser } from "@/lib/seller-auth";
import { redirect } from "next/navigation";
import { OrderProcessButtons } from "@/components/orders/OrderProcessButtons";
import { orderNumber, statusLabel } from "@/lib/orders";

export default async function SellerOrdersPage() {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");
  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId: seller.id } }, status: { not: "pending" } },
    include: {
      user: true,
      items: { where: { sellerId: seller.id } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Orders</h1>
        <p className="text-sm text-zk-ink/60">Only lines from your shop. Address is for the rider.</p>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-zk-line">
        <table className="min-w-full text-sm">
          <thead className="bg-zk-mist text-left text-xs uppercase text-zk-ink/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th>Customer</th>
              <th>Your items</th>
              <th>Status</th>
              <th>Your total</th>
              <th>When</th>
              <th>Process</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const lineTotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
              let address = "";
              try {
                const parsed = JSON.parse(order.addressJson || "{}") as { line1?: string; city?: string };
                address = [parsed.line1, parsed.city].filter(Boolean).join(", ");
              } catch {
                address = "";
              }
              return (
                <tr key={order.id} className="border-t border-zk-line">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{orderNumber(order.id)}</td>
                  <td>
                    <p>+91 {order.user.phone}</p>
                    {address ? <p className="text-xs text-zk-ink/45">{address}</p> : null}
                  </td>
                  <td>{order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                  <td>{statusLabel(order.status)}</td>
                  <td className="font-semibold">{formatInr(lineTotal)}</td>
                  <td>{order.createdAt.toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-3">
                    <OrderProcessButtons orderId={order.id} status={order.status} />
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zk-ink/50">
                  No orders for this shop yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
