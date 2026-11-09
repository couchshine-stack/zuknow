"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AccountPage() {
  const { user, loading, openLogin, logout } = useAuth();

  if (loading) return <p className="text-slate-400">Loading…</p>;

  if (!user) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-apple-card ring-1 ring-slate-900/[0.06] sm:p-14">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl ring-1 ring-orange-200/50">
          📱
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900">Your zuknow account</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in with your WhatsApp number to manage addresses and orders.</p>
        <button className="btn-primary mt-6" onClick={() => openLogin("/account")}>
          Login with WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Hi{user.name ? `, ${user.name}` : ""}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">+91 {user.phone}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/orders" className="group rounded-2xl sm:rounded-3xl bg-white p-6 font-bold text-slate-900 shadow-apple-card ring-1 ring-slate-900/[0.05] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-hover">
          <p className="font-display text-lg">My Orders</p>
          <p className="mt-1 text-xs font-normal text-slate-500">Track and review past deliveries</p>
        </Link>
        <Link href="/cart" className="group rounded-2xl sm:rounded-3xl bg-white p-6 font-bold text-slate-900 shadow-apple-card ring-1 ring-slate-900/[0.05] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-hover">
          <p className="font-display text-lg">Cart & Checkout</p>
          <p className="mt-1 text-xs font-normal text-slate-500">Items ready for 15-minute dispatch</p>
        </Link>
      </div>
      <button onClick={() => logout()} className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
        Log out
      </button>
    </div>
  );
}
