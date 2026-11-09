"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CatalogItem } from "@/data/catalog";
import { deliveryFeeFor } from "@/lib/utils";
import { usePublicConfig } from "@/components/config/PublicConfigProvider";

export type CartLine = { id: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  items: Array<CartLine & { product: CatalogItem }>;
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zk_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { freeDeliveryOver, deliveryFee: fee } = usePublicConfig();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: { items?: CatalogItem[] }) => setCatalog(data.items || []))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((line) => line.id === id);
      if (found) {
        return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + qty } : line));
      }
      return [...prev, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((line) => line.id !== id);
      return prev.map((line) => (line.id === id ? { ...line, qty } : line));
    });
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const items = lines
      .map((line) => {
        const product = catalog.find((item) => item.id === line.id);
        if (!product) return null;
        return { ...line, product };
      })
      .filter((row): row is CartLine & { product: CatalogItem } => Boolean(row));
    const subtotal = items.reduce((sum, line) => sum + line.product.price * line.qty, 0);
    const deliveryFee = items.length ? deliveryFeeFor(subtotal, freeDeliveryOver, fee) : 0;
    const count = items.reduce((sum, line) => sum + line.qty, 0);
    return {
      lines,
      items,
      count,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, catalog, add, setQty, remove, clear, freeDeliveryOver, fee]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
