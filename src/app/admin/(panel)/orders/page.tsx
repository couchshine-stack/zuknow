import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminEmptyRow, AdminFilterChips, AdminPagination } from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_SIZE,
  adminHref,
  adminPageCount,
  clampAdminPage,
  mergeWhere,
  parseAdminPage,
  parseAdminQuery,
} from "@/lib/admin-list";
import type { Prisma } from "@prisma/client";
import { OrderProcessButtons } from "@/components/orders/OrderProcessButtons";
import { orderNumber, statusLabel } from "@/lib/orders";

const STATUSES = ["all", "paid", "accepted", "packing", "out", "delivered", "cancelled", "failed", "pending"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = parseAdminQuery(params.q);
  const status = STATUSES.includes(params.status as (typeof STATUSES)[number])
    ? (params.status as (typeof STATUSES)[number])
    : "all";
  const requested = parseAdminPage(params.page);

  const where = mergeWhere<Prisma.OrderWhereInput>([
    q
      ? {
          OR: [
            { id: { contains: q.replace(/^zk-?/i, "") } },
            { user: { phone: { contains: q } } },
            { user: { name: { contains: q } } },
            { items: { some: { name: { contains: q } } } },
          ],
        }
      : undefined,
    status === "all" ? undefined : { status },
  ]);

  const total = await prisma.order.count({ where });
  const page = clampAdminPage(requested, total);
  const orders = await prisma.order.findMany({
    where,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  const href = (next: { q?: string; page?: number; status?: string }) =>
    adminHref("/admin/orders", {
      q: next.q ?? q,
      status: (next.status ?? status) === "all" ? undefined : next.status ?? status,
      page: next.page ?? page,
    });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Orders</h1>
        <p className="text-sm text-zk-ink/60">{total} orders</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchBar
          action="/admin/orders"
          q={q}
          placeholder="Search order id, phone, or item"
          extra={{ status: status === "all" ? undefined : status }}
        />
        <AdminFilterChips
          value={status}
          options={STATUSES.map((value) => ({
            value,
            label: value === "all" ? "All" : value[0].toUpperCase() + value.slice(1),
          }))}
          hrefFor={(value) => href({ status: value, page: 1 })}
        />
      </div>
      <div className="overflow-x-auto rounded-3xl border border-slate-900/[0.06] bg-white/90 shadow-apple-card backdrop-blur-xl">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Order</th>
              <th className="py-3.5">Customer</th>
              <th className="py-3.5">Items</th>
              <th className="py-3.5">Status</th>
              <th className="py-3.5">Total</th>
              <th className="py-3.5">When</th>
              <th className="py-3.5 pr-4">Process</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">{orderNumber(order.id)}</td>
                <td className="py-3.5 font-medium text-slate-900">+91 {order.user.phone}</td>
                <td className="py-3.5 text-xs text-slate-600 max-w-xs truncate">{order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    order.status === "delivered"
                      ? "bg-emerald-50 text-emerald-700"
                      : order.status === "cancelled" || order.status === "failed"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-sky-50 text-sky-700"
                  }`}>
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td className="py-3.5 font-semibold text-slate-900">{formatInr(order.total)}</td>
                <td className="py-3.5 text-xs text-slate-500">{order.createdAt.toLocaleString("en-IN")}</td>
                <td className="py-3.5 pr-4">
                  <OrderProcessButtons orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <AdminEmptyRow cols={7} message={q ? `No orders match “${q}”.` : "No orders yet."} />
            ) : null}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={page}
        pageCount={adminPageCount(total)}
        total={total}
        hrefFor={(nextPage) => href({ page: nextPage })}
      />
    </div>
  );
}
