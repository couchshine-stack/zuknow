import { AdminLoginForm } from "./AdminLoginForm";
import { getAdminUser } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zk-navy px-4">
      <AdminLoginForm />
    </div>
  );
}
