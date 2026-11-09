"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Aisle", icon: LayoutGrid },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/account", label: "You", icon: UserRound },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-900/[0.06] bg-white/85 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl backdrop-saturate-180 md:hidden">
      <ul className="grid grid-cols-5 px-1 py-1">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] transition-all duration-200 active:scale-95",
                  active
                    ? "font-bold text-zk-orange"
                    : "font-medium text-slate-500 hover:text-slate-800",
                )}
              >
                <span className={cn(
                  "relative flex items-center justify-center rounded-full p-1 transition-all duration-200",
                  active && "bg-orange-50 ring-1 ring-orange-200/60"
                )}>
                  <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} />
                  {tab.href === "/cart" && count > 0 ? (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zk-orange px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {count}
                    </span>
                  ) : null}
                </span>
                <span className="leading-none">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
