import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminUser } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <AdminNav />
      <div className="min-w-0 flex-1 overflow-auto p-6 md:p-8">{children}</div>
    </div>
  );
}
