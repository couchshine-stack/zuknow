import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SellerForm } from "@/components/admin/SellerForm";

export default async function EditSellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [seller, categories] = await Promise.all([
    prisma.seller.findUnique({ where: { id } }),
    prisma.sellerCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!seller) notFound();
  return (
    <div>
      <h1 className="mb-5 font-display text-3xl font-extrabold text-zk-navy">Edit seller</h1>
      <SellerForm
        seller={{
          ...seller,
          commissionPercent: seller.commissionPercent == null ? "" : String(seller.commissionPercent),
        }}
        categories={categories}
      />
    </div>
  );
}
