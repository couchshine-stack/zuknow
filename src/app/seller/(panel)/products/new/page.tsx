import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveSellerProductAction } from "@/app/seller/actions";
import { getSellerUser } from "@/lib/seller-auth";
import { redirect } from "next/navigation";

export default async function NewSellerProductPage() {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-extrabold text-zk-navy">New product</h1>
      <ProductForm
        categories={categories}
        sellers={[]}
        action={saveSellerProductAction}
        lockedSellerId={seller.id}
        showCommission={false}
      />
    </div>
  );
}
