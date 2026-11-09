"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { orderNumber, statusLabel } from "@/lib/orders";

type Found = {
  id: string;
  status: string;
  total: number;
  etaMinutes: number;
  items: Array<{ id: string; name: string; qty: number }>;
};

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Found | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not find that order.");
      return;
    }
    setOrder(data.order);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-zk-orange">Live Status</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">Track your order</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the order reference from your checkout (e.g. ZK-A1B2C3D4) and the phone number used.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-6 sm:p-8 shadow-apple-card ring-1 ring-slate-900/[0.06]">
        <label className="block text-sm font-semibold text-slate-800">
          Order number
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="ZK-A1B2C3D4"
            className="input uppercase"
            autoComplete="off"
            required
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Phone number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="input"
            inputMode="numeric"
            required
          />
        </label>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Searching…" : "Track order"}
        </button>
      </form>
      {order ? (
        <div className="rounded-3xl bg-white p-6 shadow-apple-card ring-1 ring-slate-900/[0.06]">
          <p className="font-mono text-xs font-bold text-zk-orange">{orderNumber(order.id)}</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-slate-900">{statusLabel(order.status)}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-semibold text-slate-900">× {item.qty}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-semibold text-slate-600">Total Paid</span>
            <span className="font-display text-lg font-extrabold text-slate-900">{formatInr(order.total)}</span>
          </div>
          <Link href={`/orders/${order.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-zk-blue hover:text-zk-orange transition-colors">
            Open order details →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
