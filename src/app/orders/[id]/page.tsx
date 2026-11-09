"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatInr } from "@/lib/utils";
import { customerHeadline, orderNumber, PROCESS_STEPS, statusLabel } from "@/lib/orders";

type OrderDetail = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  etaMinutes: number;
  razorpayPaymentId: string | null;
  items: Array<{ id: string; name: string; qty: number; price: number }>;
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        setOrder(data.order);
      })
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-rose-50/70 p-6 text-center text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex max-w-xl items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  const stepIndex = PROCESS_STEPS.indexOf(order.status as (typeof PROCESS_STEPS)[number]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-3xl border border-slate-900/[0.06] bg-white/90 p-7 shadow-apple-card backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Status
          </span>
          <span className="font-mono text-xs font-semibold text-slate-400">
            {orderNumber(order.id)}
          </span>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {customerHeadline(order.status, order.etaMinutes)}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{statusLabel(order.status)}</p>

        {stepIndex >= 0 ? (
          <div className="mt-6">
            <ol className="grid grid-cols-5 gap-1.5 text-center text-[11px] font-semibold">
              {PROCESS_STEPS.map((step, index) => {
                const isPassed = index <= stepIndex;
                const isCurrent = index === stepIndex;
                return (
                  <li
                    key={step}
                    className={`rounded-xl py-2 transition-all ${
                      isCurrent
                        ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10 font-bold"
                        : isPassed
                        ? "bg-emerald-50 text-emerald-800 font-medium"
                        : "bg-slate-100/80 text-slate-400"
                    }`}
                  >
                    {step === "out" ? "Out" : step.charAt(0).toUpperCase() + step.slice(1)}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Items Ordered</p>
          <ul className="mt-3 divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-slate-800">
                  <span className="font-semibold text-slate-900">{item.qty}×</span> {item.name}
                </span>
                <span className="font-medium text-slate-900">{formatInr(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatInr(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? "Free" : formatInr(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
            <span>Total Paid</span>
            <span className="font-display text-lg">{formatInr(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-500">
          Track anytime at{" "}
          <Link href="/track" className="font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2">
            zuknow.in/track
          </Link>{" "}
          using your registered phone number.
        </div>
      </div>
    </div>
  );
}
