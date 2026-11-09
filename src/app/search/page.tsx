import type { Metadata } from "next";
import { ProductRail } from "@/components/home/ProductRail";
import { searchItems } from "@/lib/catalog";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const items = await searchItems(q);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-apple-card ring-1 ring-slate-900/[0.06] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-zk-orange">Search Results</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
          {q ? `“${q}”` : "Everything"}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{items.length} items found · 15 min delivery</p>
      </header>
      {items.length ? (
        <ProductRail title="Matches" items={items} />
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center shadow-apple-card ring-1 ring-slate-900/[0.06]">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-display text-base font-bold text-slate-800">No matching items found</p>
          <p className="mt-1 text-xs text-slate-500">Try searching for “milk”, “cook”, “hammer”, or “charger”.</p>
        </div>
      )}
    </div>
  );
}
