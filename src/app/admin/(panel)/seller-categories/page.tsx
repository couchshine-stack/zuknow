import { prisma } from "@/lib/db";
import { deleteSellerCategoryAction, saveSellerCategoryAction } from "@/app/admin/actions";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_SIZE,
  adminHref,
  adminPageCount,
  clampAdminPage,
  parseAdminPage,
  parseAdminQuery,
} from "@/lib/admin-list";
import type { Prisma } from "@prisma/client";

export default async function SellerCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = parseAdminQuery(params.q);
  const requested = parseAdminPage(params.page);
  const where: Prisma.SellerCategoryWhereInput = q
    ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }, { description: { contains: q } }] }
    : {};

  const total = await prisma.sellerCategory.count({ where });
  const page = clampAdminPage(requested, total);
  const categories = await prisma.sellerCategory.findMany({
    where,
    include: { _count: { select: { sellers: true } } },
    orderBy: { name: "asc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Seller categories</h1>
        <p className="mb-4 text-sm text-zk-ink/60">Each category has a default commission. Sellers can override it.</p>
        <AdminSearchBar action="/admin/seller-categories" q={q} placeholder="Search category name or slug" />
        <div className="mt-4 space-y-3">
          {categories.map((cat) => (
            <form
              key={cat.id}
              action={saveSellerCategoryAction}
              className="rounded-3xl bg-white p-4 ring-1 ring-zk-line"
            >
              <input type="hidden" name="id" value={cat.id} />
              <div className="grid gap-2 sm:grid-cols-2">
                <input name="name" defaultValue={cat.name} className="input" />
                <input name="slug" defaultValue={cat.slug} className="input" />
                <input
                  name="commissionPercent"
                  type="number"
                  step="0.01"
                  defaultValue={Number(cat.commissionPercent)}
                  className="input"
                />
                <input name="description" defaultValue={cat.description} className="input" />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-zk-ink/50">{cat._count.sellers} sellers</span>
                <div className="flex gap-3">
                  <button className="font-semibold text-zk-blue">Save</button>
                  {cat._count.sellers === 0 ? (
                    <button formAction={deleteSellerCategoryAction} className="text-red-600">
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          ))}
          {categories.length === 0 ? (
            <p className="rounded-3xl bg-white px-4 py-10 text-center text-sm text-zk-ink/50 ring-1 ring-zk-line">
              {q ? `No categories match “${q}”.` : "No seller categories yet."}
            </p>
          ) : null}
        </div>
        <AdminPagination
          page={page}
          pageCount={adminPageCount(total)}
          total={total}
          hrefFor={(nextPage) => adminHref("/admin/seller-categories", { q, page: nextPage })}
        />
      </div>
      <form action={saveSellerCategoryAction} className="h-fit rounded-3xl bg-white p-5 ring-1 ring-zk-line">
        <h2 className="font-display text-lg font-bold text-zk-navy">Add category</h2>
        <label className="mt-3 block text-sm font-semibold">
          Name
          <input name="name" required className="input" />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Default commission %
          <input name="commissionPercent" type="number" step="0.01" defaultValue={15} className="input" />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Description
          <input name="description" className="input" />
        </label>
        <button className="btn-primary mt-5 w-full">Create category</button>
      </form>
    </div>
  );
}
