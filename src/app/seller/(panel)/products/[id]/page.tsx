import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveSellerProductAction } from "@/app/seller/actions";
import { getSellerUser } from "@/lib/seller-auth";

export default async function EditSellerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({ where: { id, sellerId: seller.id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-extrabold text-zk-navy">Edit product</h1>
      <ProductForm
        product={{
          ...product,
          commissionPercent: product.commissionPercent == null ? "" : String(product.commissionPercent),
        }}
        categories={categories}
        sellers={[]}
        action={saveSellerProductAction}
        lockedSellerId={seller.id}
        showCommission={false}
      />
    </div>
  );
}
