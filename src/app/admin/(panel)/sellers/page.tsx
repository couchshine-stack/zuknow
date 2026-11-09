import Link from "next/link";
import { prisma } from "@/lib/db";
import { effectiveCommissionPercent } from "@/lib/commission";
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

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = parseAdminQuery(params.q);
  const status = params.status === "active" || params.status === "paused" ? params.status : "all";
  const requested = parseAdminPage(params.page);

  const where = mergeWhere<Prisma.SellerWhereInput>([
    q
      ? {
          OR: [
            { shopName: { contains: q } },
            { ownerName: { contains: q } },
            { phone: { contains: q } },
            { city: { contains: q } },
            { email: { contains: q } },
            { sellerCategory: { name: { contains: q } } },
          ],
        }
      : undefined,
    status === "all" ? undefined : { status },
  ]);

  const total = await prisma.seller.count({ where });
  const page = clampAdminPage(requested, total);
  const sellers = await prisma.seller.findMany({
    where,
    include: { sellerCategory: true, _count: { select: { products: true } } },
    orderBy: { shopName: "asc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  const href = (next: { q?: string; page?: number; status?: string }) =>
    adminHref("/admin/sellers", {
      q: next.q ?? q,
      status: (next.status ?? status) === "all" ? undefined : next.status ?? status,
      page: next.page ?? page,
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-zk-navy">Sellers</h1>
          <p className="text-sm text-zk-ink/60">{total} shops · they log in at /seller</p>
        </div>
        <Link href="/admin/sellers/new" className="btn-primary h-11">
          Add seller
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchBar
          action="/admin/sellers"
          q={q}
          placeholder="Search shop, owner, phone, city, or category"
          extra={{ status: status === "all" ? undefined : status }}
        />
        <AdminFilterChips
          value={status}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
          ]}
          hrefFor={(value) => href({ status: value, page: 1 })}
        />
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-zk-line">
        <table className="min-w-full text-sm">
          <thead className="bg-zk-mist text-left text-xs uppercase tracking-wide text-zk-ink/50">
            <tr>
              <th className="px-4 py-3">Shop</th>
              <th>Owner</th>
              <th>Category</th>
              <th>Commission</th>
              <th>Products</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id} className="border-t border-zk-line">
                <td className="px-4 py-3">
                  <p className="font-semibold text-zk-navy">{s.shopName}</p>
                  <p className="text-xs text-zk-ink/45">
                    {s.city} · {s.phone}
                  </p>
                </td>
                <td>{s.ownerName}</td>
                <td>{s.sellerCategory.name}</td>
                <td>
                  {effectiveCommissionPercent({
                    productPercent: null,
                    sellerPercent: s.commissionPercent,
                    categoryPercent: s.sellerCategory.commissionPercent,
                  })}
                  %
                </td>
                <td>{s._count.products}</td>
                <td className="capitalize">{s.status}</td>
                <td className="px-4">
                  <Link href={`/admin/sellers/${s.id}`} className="font-semibold text-zk-blue">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {sellers.length === 0 ? (
              <AdminEmptyRow cols={7} message={q ? `No sellers match “${q}”.` : "No sellers yet."} />
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
