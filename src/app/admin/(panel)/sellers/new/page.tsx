import { prisma } from "@/lib/db";
import { SellerForm } from "@/components/admin/SellerForm";

export default async function NewSellerPage() {
  const categories = await prisma.sellerCategory.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-extrabold text-zk-navy">New seller</h1>
      <SellerForm categories={categories} />
    </div>
  );
}
