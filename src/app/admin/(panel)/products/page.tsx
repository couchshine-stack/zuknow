import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { deleteProductAction } from "@/app/admin/actions";
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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = parseAdminQuery(params.q);
  const status = params.status === "live" || params.status === "hidden" ? params.status : "all";
  const requested = parseAdminPage(params.page);

  const where = mergeWhere<Prisma.ProductWhereInput>([
    q
      ? {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
            { seller: { shopName: { contains: q } } },
            { category: { name: { contains: q } } },
          ],
        }
      : undefined,
    status === "live" ? { active: true } : status === "hidden" ? { active: false } : undefined,
  ]);

  const total = await prisma.product.count({ where });
  const page = clampAdminPage(requested, total);
  const products = await prisma.product.findMany({
    where,
    include: { category: true, seller: { include: { sellerCategory: true } } },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  const href = (next: { q?: string; page?: number; status?: string }) =>
    adminHref("/admin/products", {
      q: next.q ?? q,
      status: (next.status ?? status) === "all" ? undefined : next.status ?? status,
      page: next.page ?? page,
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-zk-navy">Products</h1>
          <p className="text-sm text-zk-ink/60">{total} in MySQL · live on the storefront when Active</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary h-11">
          Add product
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchBar
          action="/admin/products"
          q={q}
          placeholder="Search name, slug, aisle, or seller"
          extra={{ status: status === "all" ? undefined : status }}
        />
        <AdminFilterChips
          value={status}
          options={[
            { value: "all", label: "All" },
            { value: "live", label: "Live" },
            { value: "hidden", label: "Hidden" },
          ]}
          hrefFor={(value) => href({ status: value, page: 1 })}
        />
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-zk-line">
        <table className="min-w-full text-sm">
          <thead className="bg-zk-mist text-left text-xs uppercase tracking-wide text-zk-ink/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th>Aisle</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Commission</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const pct = effectiveCommissionPercent({
                productPercent: p.commissionPercent,
                sellerPercent: p.seller.commissionPercent,
                categoryPercent: p.seller.sellerCategory.commissionPercent,
              });
              return (
                <tr key={p.id} className="border-t border-zk-line">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zk-navy">{p.name}</p>
                    <p className="text-xs text-zk-ink/45">{p.slug}</p>
                  </td>
                  <td>{p.category.name}</td>
                  <td>{p.seller.shopName}</td>
                  <td className="font-semibold">{formatInr(p.price)}</td>
                  <td>{pct}%</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={p.active ? "text-emerald-600" : "text-zk-ink/40"}>
                      {p.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-zk-blue">
                        Edit
                      </Link>
                      {p.active ? (
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="text-red-600">Hide</button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 ? (
              <AdminEmptyRow cols={8} message={q ? `No products match “${q}”.` : "No products yet."} />
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
