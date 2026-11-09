"use client";

import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

export function QtyControl({
  id,
  className,
  addLabel = "Add",
}: {
  id: string;
  className?: string;
  addLabel?: string;
}) {
  const { items, add, setQty } = useCart();
  const line = items.find((item) => item.id === id);
  const qty = line?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        onClick={() => add(id)}
        className={cn(
          "inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#1D1D1F] px-3.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-black hover:scale-105 active:scale-95",
          className,
        )}
      >
        <Plus className="h-3 w-3 stroke-[2.5]" />
        <span>{addLabel}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-8 items-center rounded-full bg-[#1D1D1F] px-1 text-white shadow-sm",
        className,
      )}
    >
      <button
        aria-label="Decrease quantity"
        className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-75"
        onClick={() => setQty(id, qty - 1)}
      >
        <Minus className="h-3 w-3 stroke-[2.5]" />
      </button>
      <span className="min-w-5 text-center text-xs font-bold tabular-nums text-white">
        {qty}
      </span>
      <button
        aria-label="Increase quantity"
        className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-75"
        onClick={() => add(id)}
      >
        <Plus className="h-3 w-3 stroke-[2.5]" />
      </button>
    </div>
  );
}
