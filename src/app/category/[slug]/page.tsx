import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { getCategory, itemsByCategory, listCategories } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return { title: category?.name ?? "Aisle" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, items, more] = await Promise.all([
    getCategory(slug),
    itemsByCategory(slug),
    listCategories(),
  ]);
  if (!category || items.length === 0) notFound();

  return (
    <div className="space-y-8">
      <header
        className={cn(
          "rounded-3xl sm:rounded-[2.25rem] bg-gradient-to-br p-6 shadow-apple-card ring-1 ring-slate-900/[0.06] sm:p-8",
          category.tint,
        )}
      >
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 text-3xl sm:text-4xl shadow-sm ring-1 ring-black/5">
          {category.emoji}
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{category.name}</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">{category.tagline} · 15-minute delivery from Amravati dark stores</p>
      </header>
      <ProductRail title={`${items.length} items in this aisle`} items={items} />
      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-slate-900">Explore more aisles</h2>
        <CategoryGrid categories={more} compact />
      </section>
    </div>
  );
}
