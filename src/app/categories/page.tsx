import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { listCategories, serviceItems } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Aisles" };

export default async function CategoriesPage() {
  const [productCats, services] = await Promise.all([listCategories("product"), serviceItems()]);
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl sm:rounded-[2.25rem] bg-gradient-to-br from-[#09111F] via-[#0D1C36] to-[#12284D] px-6 py-8 text-white shadow-apple-card ring-1 ring-white/10 sm:px-8">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zk-orange">Amravati Aisles</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Every aisle</h1>
          <p className="mt-1 max-w-lg text-sm text-slate-300">If it fits on a scooter or in a kit bag, it ships in 15 minutes.</p>
        </div>
        <div className="hidden gap-2.5 sm:flex">
          {productCats.slice(0, 4).map((cat) => (
            <span key={cat.slug} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/15 backdrop-blur-md">
              {cat.emoji}
            </span>
          ))}
        </div>
      </header>
      <CategoryGrid categories={productCats} />
      <ServiceStrip items={services} />
    </div>
  );
}
