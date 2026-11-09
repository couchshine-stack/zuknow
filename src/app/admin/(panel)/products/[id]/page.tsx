import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, sellers] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.seller.findMany({ orderBy: { shopName: "asc" } }),
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
        sellers={sellers}
      />
    </div>
  );
}
