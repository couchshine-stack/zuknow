import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { saveCommissionOverrideAction } from "@/app/admin/actions";
import { effectiveCommissionPercent } from "@/lib/commission";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminEmptyRow, AdminPagination } from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_SIZE,
  adminHref,
  adminPageCount,
  clampAdminPage,
  parseAdminPage,
  parseAdminQuery,
} from "@/lib/admin-list";
import type { Prisma } from "@prisma/client";

export default async function CommissionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; lq?: string; lpage?: string }>;
}) {
  const params = await searchParams;
  const q = parseAdminQuery(params.q);
  const lq = parseAdminQuery(params.lq);
  const sellerPageReq = parseAdminPage(params.page);
  const ledgerPageReq = parseAdminPage(params.lpage);

  const sellerWhere: Prisma.SellerWhereInput = q
    ? {
        OR: [{ shopName: { contains: q } }, { ownerName: { contains: q } }, { sellerCategory: { name: { contains: q } } }],
      }
    : {};

  const ledgerWhere: Prisma.CommissionWhereInput = lq
    ? {
        OR: [{ seller: { shopName: { contains: lq } } }, { orderId: { contains: lq } }],
      }
    : {};

  const [totals, categories, sellerTotal, ledgerTotal] = await Promise.all([
    prisma.commission.aggregate({ _sum: { commissionAmount: true, sellerEarning: true, gross: true } }),
    prisma.sellerCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.seller.count({ where: sellerWhere }),
    prisma.commission.count({ where: ledgerWhere }),
  ]);

  const sellerPage = clampAdminPage(sellerPageReq, sellerTotal);
  const ledgerPage = clampAdminPage(ledgerPageReq, ledgerTotal);

  const [sellers, ledger] = await Promise.all([
    prisma.seller.findMany({
      where: sellerWhere,
      include: { sellerCategory: true },
      orderBy: { shopName: "asc" },
      skip: (sellerPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.commission.findMany({
      where: ledgerWhere,
      include: { seller: true, order: true },
      orderBy: { createdAt: "desc" },
      skip: (ledgerPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
  ]);

  const sellerHref = (page: number) => adminHref("/admin/commission", { q, page, lq, lpage: ledgerPage });
  const ledgerHref = (lpage: number) => adminHref("/admin/commission", { q, page: sellerPage, lq, lpage });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Commission</h1>
        <p className="text-sm text-zk-ink/60">
          Default % sits on seller category. Seller override, then product override. Accrued when an order is paid.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
          <p className="text-xs uppercase text-zk-ink/50">GMV (accrued)</p>
          <p className="font-display text-2xl font-extrabold">{formatInr(totals._sum.gross || 0)}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
          <p className="text-xs uppercase text-zk-ink/50">Platform commission</p>
          <p className="font-display text-2xl font-extrabold text-zk-orange">
            {formatInr(totals._sum.commissionAmount || 0)}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
          <p className="text-xs uppercase text-zk-ink/50">Seller payout</p>
          <p className="font-display text-2xl font-extrabold">{formatInr(totals._sum.sellerEarning || 0)}</p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
        <h2 className="font-display text-lg font-bold">Category defaults</h2>
        <div className="mt-3 space-y-2">
          {categories.map((cat) => (
            <form key={cat.id} action={saveCommissionOverrideAction} className="flex items-center gap-3">
              <input type="hidden" name="kind" value="category" />
              <input type="hidden" name="id" value={cat.id} />
              <span className="w-56 text-sm font-semibold">{cat.name}</span>
              <input
                name="commissionPercent"
                type="number"
                step="0.01"
                defaultValue={Number(cat.commissionPercent)}
                className="input max-w-28"
              />
              <button className="text-sm font-semibold text-zk-blue">Save</button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Seller overrides</h2>
          <AdminSearchBar
            action="/admin/commission"
            q={q}
            placeholder="Search seller or category"
            extra={{ lq, lpage: ledgerPage > 1 ? String(ledgerPage) : undefined }}
          />
        </div>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-zk-ink/50">
            <tr>
              <th className="py-2">Seller</th>
              <th>Category default</th>
              <th>Effective</th>
              <th>Override</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id} className="border-t border-zk-line">
                <td className="py-2">{s.shopName}</td>
                <td>{Number(s.sellerCategory.commissionPercent)}%</td>
                <td>
                  {effectiveCommissionPercent({
                    productPercent: null,
                    sellerPercent: s.commissionPercent,
                    categoryPercent: s.sellerCategory.commissionPercent,
                  })}
                  %
                </td>
                <td>
                  <form action={saveCommissionOverrideAction} className="flex items-center gap-2">
                    <input type="hidden" name="kind" value="seller" />
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      name="commissionPercent"
                      type="number"
                      step="0.01"
                      defaultValue={s.commissionPercent == null ? "" : Number(s.commissionPercent)}
                      placeholder="default"
                      className="input max-w-24"
                    />
                    <button className="text-zk-blue">Save</button>
                  </form>
                </td>
              </tr>
            ))}
            {sellers.length === 0 ? (
              <AdminEmptyRow cols={4} message={q ? `No sellers match “${q}”.` : "No sellers yet."} />
            ) : null}
          </tbody>
        </table>
        <AdminPagination
          page={sellerPage}
          pageCount={adminPageCount(sellerTotal)}
          total={sellerTotal}
          hrefFor={sellerHref}
        />
      </section>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Ledger</h2>
          <AdminSearchBar
            action="/admin/commission"
            name="lq"
            q={lq}
            placeholder="Search seller or order id"
            extra={{ q, page: sellerPage > 1 ? String(sellerPage) : undefined }}
          />
        </div>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-zk-ink/50">
            <tr>
              <th className="py-2">When</th>
              <th>Seller</th>
              <th>Order</th>
              <th>Gross</th>
              <th>%</th>
              <th>Platform</th>
              <th>Seller</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((row) => (
              <tr key={row.id} className="border-t border-zk-line">
                <td className="py-2">{row.createdAt.toLocaleString("en-IN")}</td>
                <td>{row.seller.shopName}</td>
                <td className="font-mono text-xs">#{row.orderId.slice(-8)}</td>
                <td>{formatInr(row.gross)}</td>
                <td>{Number(row.commissionPercent)}%</td>
                <td>{formatInr(row.commissionAmount)}</td>
                <td>{formatInr(row.sellerEarning)}</td>
              </tr>
            ))}
            {ledger.length === 0 ? (
              <AdminEmptyRow
                cols={7}
                message={lq ? `No ledger rows match “${lq}”.` : "Commission posts after Razorpay payment is verified."}
              />
            ) : null}
          </tbody>
        </table>
        <AdminPagination
          page={ledgerPage}
          pageCount={adminPageCount(ledgerTotal)}
          total={ledgerTotal}
          hrefFor={ledgerHref}
        />
      </section>
    </div>
  );
}
