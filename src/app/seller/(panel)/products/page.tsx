import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { getSellerUser } from "@/lib/seller-auth";
import { hideSellerProductAction } from "@/app/seller/actions";
import { redirect } from "next/navigation";

export default async function SellerProductsPage() {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-zk-navy">Your products</h1>
          <p className="text-sm text-zk-ink/60">{products.length} in this shop · upload a photo when you add one</p>
        </div>
        <Link href="/seller/products/new" className="btn-primary h-11">
          Add product
        </Link>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-zk-line">
        <table className="min-w-full text-sm">
          <thead className="bg-zk-mist text-left text-xs uppercase tracking-wide text-zk-ink/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th>Aisle</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-zk-line">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image ? <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : null}
                    <div>
                      <p className="font-semibold text-zk-navy">{p.name}</p>
                      <p className="text-xs text-zk-ink/45">{p.unit}</p>
                    </div>
                  </div>
                </td>
                <td>{p.category.name}</td>
                <td className="font-semibold">{formatInr(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={p.active ? "text-emerald-600" : "text-zk-ink/40"}>{p.active ? "Live" : "Hidden"}</span>
                </td>
                <td className="px-4">
                  <div className="flex gap-2">
                    <Link href={`/seller/products/${p.id}`} className="font-semibold text-zk-blue">
                      Edit
                    </Link>
                    {p.active ? (
                      <form action={hideSellerProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-red-600">Hide</button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zk-ink/50">
                  No products yet. Add one and upload a photo.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
