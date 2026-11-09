import { SellerLoginForm } from "./SellerLoginForm";
import { getSellerUser } from "@/lib/seller-auth";
import { redirect } from "next/navigation";

export default async function SellerLoginPage() {
  const seller = await getSellerUser();
  if (seller) redirect("/seller");
  return (
    <div className="flex min-h-screen items-center justify-center bg-zk-navy px-4">
      <SellerLoginForm />
    </div>
  );
}
