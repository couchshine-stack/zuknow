"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  Percent,
  Store,
  Tags,
  ShoppingBag,
  LogOut,
  Settings,
} from "lucide-react";
import { adminLogoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/seller-categories", label: "Seller categories", icon: Tags },
  { href: "/admin/commission", label: "Commission", icon: Percent },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-zk-navy text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-display text-lg font-extrabold">
          zukn<span className="text-zk-orange">o</span>w admin
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">15-min commerce</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={adminLogoutAction} className="border-t border-white/10 p-3">
        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </form>
    </aside>
  );
}
