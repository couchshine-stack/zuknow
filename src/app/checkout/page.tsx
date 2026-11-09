"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatInr, isValidIndianMobile } from "@/lib/utils";
import { useLocation } from "@/components/location/LocationProvider";
import { CartEta } from "@/components/location/CartEta";
import { usePublicConfig } from "@/components/config/PublicConfigProvider";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total, clear } = useCart();
  const { user, loading, openLogin, refresh } = useAuth();
  const { location } = useLocation();
  const { cityName, guestCheckout } = usePublicConfig();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    landmark: "",
    city: cityName || "Amravati",
    pincode: "",
  });

  const canPayWithoutLogin = guestCheckout;
  const needsLogin = !loading && !user && !canPayWithoutLogin;

  useEffect(() => {
    if (needsLogin) openLogin("/checkout");
  }, [needsLogin, openLogin]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      phone: prev.phone || user.phone,
      name: prev.name || user.name || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!location?.label) return;
    setForm((prev) => (prev.line1 ? prev : { ...prev, line1: location.label }));
  }, [location]);

  useEffect(() => {
    if (document.querySelector("script[data-razorpay]")) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    document.body.appendChild(script);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user && !canPayWithoutLogin) {
      openLogin("/checkout");
      return;
    }
    if (!isValidIndianMobile(form.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!items.length) {
      router.push("/cart");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((line) => ({ id: line.id, qty: line.qty })),
        address: form,
        origin: location ? { lat: location.lat, lng: location.lng } : undefined,
      }),
    });
    const data = (await res.json()) as {
      error?: string;
      orderId?: string;
      razorpayOrderId?: string;
      amount?: number;
      key?: string;
    };
    if (!res.ok || !data.razorpayOrderId || !data.key) {
      setBusy(false);
      setError(data.error || "Could not start payment.");
      return;
    }

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setBusy(false);
      setError("Razorpay is still loading. Try again in a second.");
      return;
    }

    const checkout = new Razorpay({
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "zuknow.in",
      description: "15-minute delivery",
      image: "/logo.png",
      order_id: data.razorpayOrderId,
      prefill: { contact: form.phone, name: form.name },
      theme: { color: "#163A8C" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const verified = (await verify.json()) as { ok?: boolean; error?: string };
        if (!verify.ok) {
          setBusy(false);
          setError(verified.error || "Payment could not be verified.");
          return;
        }
        clear();
        await refresh();
        router.push(`/orders/${data.orderId}`);
      },
      modal: {
        ondismiss: () => setBusy(false),
      },
    });
    checkout.open();
  }

  if (!items.length) {
    return <p className="text-slate-500">Your cart is empty. Add something first.</p>;
  }

  if (needsLogin) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-apple-card ring-1 ring-slate-900/[0.06] sm:p-12">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Login to checkout</h1>
        <p className="mt-2 text-sm text-slate-500">Guest checkout is off. Sign in with WhatsApp to pay.</p>
        <button type="button" className="btn-primary mt-6" onClick={() => openLogin("/checkout")}>
          Login with WhatsApp
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl bg-white p-6 shadow-apple-card ring-1 ring-slate-900/[0.06] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-zk-orange">Express Checkout</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Deliver in 15 mins</h1>
        <p className="mb-6 text-sm text-slate-500">Enter delivery address for our dark store rider or pro.</p>
        {!user && canPayWithoutLogin ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50/80 p-3.5 text-xs ring-1 ring-slate-900/[0.04]">
            <p className="text-slate-600">Checking out as guest. You can log in with WhatsApp anytime to track orders.</p>
            <button type="button" className="font-bold text-zk-blue hover:text-zk-orange transition-colors" onClick={() => openLogin("/checkout")}>
              Login instead
            </button>
          </div>
        ) : null}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {(
            [
              ["name", "Full name"],
              ["phone", "Phone number"],
              ["line1", "House / street / locality"],
              ["landmark", "Landmark (optional)"],
              ["city", "City"],
              ["pincode", "PIN code"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
              <input
                required={key !== "landmark"}
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                inputMode={key === "phone" || key === "pincode" ? "numeric" : undefined}
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-800 outline-none transition focus:border-zk-blue focus:bg-white focus:ring-2 focus:ring-zk-blue/20"
              />
            </label>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-3xl bg-gradient-to-br from-[#09111F] via-[#0D1C36] to-[#12284D] p-6 text-white shadow-apple-card ring-1 ring-white/10 sm:p-7">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Pay {formatInr(total)}</h2>
        <p className="mt-1.5 text-sm text-slate-300">
          {items.length} item{items.length === 1 ? "" : "s"} · items {formatInr(subtotal)} · delivery{" "}
          {deliveryFee ? formatInr(deliveryFee) : "free"}
        </p>
        <p className="mt-2 text-xs font-semibold text-zk-orange">
          <CartEta items={items} />
        </p>
        {error ? <p className="mt-3 text-xs font-medium text-red-300">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full shadow-lg">
          {busy ? "Connecting to Razorpay…" : user ? "Pay with Razorpay" : "Proceed & Pay"}
        </button>
        <p className="mt-3.5 text-center text-[11px] text-slate-400">
          UPI, Google Pay, PhonePe, Cards, Netbanking · 256-bit Razorpay encryption
        </p>
      </aside>
    </form>
  );
}
