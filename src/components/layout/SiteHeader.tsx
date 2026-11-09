"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { LocationPicker } from "./LocationPicker";
import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePublicConfig } from "@/components/config/PublicConfigProvider";

export function SiteHeader() {
  const { count } = useCart();
  const { user, openLogin } = useAuth();
  const { cityName } = usePublicConfig();
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/[0.05] bg-white/75 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] backdrop-blur-2xl backdrop-saturate-200">
      {/* Apple Live Activity Strip */}
      <div className="hidden border-b border-slate-100 bg-[#FAFBFD] py-1 text-center text-[11px] font-medium text-slate-600 sm:block">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>15-minute delivery live across {cityName || "Amravati"}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">Groceries, hardware, and on-demand pros</span>
        </span>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        {/* Apple-style Brand Wordmark */}
        <Link href="/" className="group flex shrink-0 items-center gap-2 transition active:scale-98">
          <Image
            src="/logo.png"
            alt="zuknow.in"
            width={36}
            height={36}
            className="h-9 w-9 object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="leading-tight">
            <span className="font-display text-lg font-extrabold tracking-tight text-[#1D1D1F]">
              zukn<span className="text-[#F97316]">o</span>w<span className="text-[#F97316]">.in</span>
            </span>
            <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
              15 Min City
            </span>
          </div>
        </Link>

        {/* Location Picker Capsule */}
        <div className="hidden md:block">
          <LocationPicker />
        </div>

        {/* Apple Capsule Search */}
        <form onSubmit={onSearch} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search groceries, hardware, electrician…"
            className="h-9 w-full rounded-full border border-slate-200/80 bg-slate-100/60 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
          />
        </form>

        {/* Nav Links */}
        <Link
          href="/track"
          className="hidden h-9 items-center rounded-full px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 sm:flex"
        >
          Track
        </Link>

        <button
          onClick={() => (user ? router.push("/account") : openLogin())}
          className="hidden h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 sm:flex"
        >
          <UserRound className="h-3.5 w-3.5 text-slate-500" />
          <span>{user ? "Account" : "Sign In"}</span>
        </button>

        {/* Obsidian Apple Cart Pill */}
        <Link
          href="/cart"
          className="relative flex h-9 items-center gap-2 rounded-full bg-[#1D1D1F] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-black active:scale-95"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Bag</span>
          {count > 0 ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F97316] px-1 text-[10px] font-bold text-white shadow-sm">
              {count}
            </span>
          ) : null}
        </Link>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 md:hidden">
        <LocationPicker />
      </div>
    </header>
  );
}
