"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { QtyControl } from "@/components/product/QtyControl";
import { formatInr } from "@/lib/utils";
import { DeliveryEta } from "@/components/location/DeliveryEta";
import { CartEta } from "@/components/location/CartEta";
import { usePublicConfig } from "@/components/config/PublicConfigProvider";

export default function CartPage() {
  const { items, subtotal, deliveryFee, total } = useCart();
  const { freeDeliveryOver, guestCheckout } = usePublicConfig();

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-apple-card ring-1 ring-slate-900/[0.06]">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-4xl shadow-sm ring-1 ring-orange-200/50">
          🛒
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add fresh groceries, a hardware tap, or an electrician. We will be there in 15.</p>
        <Link href="/" className="btn-primary mt-6">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-3.5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Cart</h1>
        {items.map((line) => (
          <div key={line.id} className="flex items-center gap-3.5 rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-4 shadow-apple-card ring-1 ring-slate-900/[0.05] transition-all hover:shadow-apple-hover">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-900/5">
              <Image src={line.product.image} alt="" fill className="object-cover" sizes="80px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-slate-900 line-clamp-1">{line.product.name}</p>
              <p className="text-xs font-medium text-slate-500">{line.product.unit}</p>
              <p className="mt-1 text-xs font-semibold text-zk-blue">
                <DeliveryEta
                  sellerLat={line.product.sellerLat}
                  sellerLng={line.product.sellerLng}
                  fallback={line.product.etaMinutes}
                  showDistance
                />
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{formatInr(line.product.price)}</p>
            </div>
            <QtyControl id={line.id} />
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-apple-card ring-1 ring-slate-900/[0.06]">
        <h2 className="font-display text-lg font-bold text-slate-900">Order Summary</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <dt>Items subtotal</dt>
            <dd className="font-medium text-slate-900">{formatInr(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-slate-600">
            <dt>Delivery fee</dt>
            <dd>{deliveryFee === 0 ? <span className="font-bold text-emerald-600">Free</span> : formatInr(deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 font-display text-lg font-extrabold text-slate-900">
            <dt>Total</dt>
            <dd>{formatInr(total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs font-medium text-slate-500">
          <CartEta items={items} /> Free delivery on ₹{freeDeliveryOver}+.
        </p>
        <Link href="/checkout" className="btn-primary mt-5 w-full">
          Proceed to Checkout
        </Link>
        {guestCheckout ? (
          <p className="mt-2.5 text-center text-xs text-slate-400">Guest checkout available — WhatsApp login optional.</p>
        ) : (
          <p className="mt-2.5 text-center text-xs text-slate-400">You will verify with WhatsApp to pay.</p>
        )}
      </aside>
    </div>
  );
}
