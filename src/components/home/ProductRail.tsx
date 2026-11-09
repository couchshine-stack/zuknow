import { ProductCard } from "@/components/product/ProductCard";
import type { CatalogItem } from "@/data/catalog";
import { SectionHeading } from "./SectionHeading";

export function ProductRail({
  title,
  subtitle,
  kicker,
  href,
  items,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  href?: string;
  items: CatalogItem[];
}) {
  if (!items.length) return null;
  return (
    <section>
      <SectionHeading kicker={kicker} title={title} subtitle={subtitle} href={href} />
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
