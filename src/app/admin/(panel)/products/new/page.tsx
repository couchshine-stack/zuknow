import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, sellers] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.seller.findMany({ orderBy: { shopName: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-extrabold text-zk-navy">New product</h1>
      <ProductForm categories={categories} sellers={sellers} />
    </div>
  );
}
