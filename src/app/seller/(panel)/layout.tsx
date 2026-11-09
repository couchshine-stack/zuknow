import { redirect } from "next/navigation";
import { getSellerUser } from "@/lib/seller-auth";
import { SellerNav } from "@/components/seller/SellerNav";

export default async function SellerPanelLayout({ children }: { children: React.ReactNode }) {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <SellerNav shopName={seller.shopName} />
      <div className="min-w-0 flex-1 overflow-auto p-6 md:p-8">{children}</div>
    </div>
  );
}
