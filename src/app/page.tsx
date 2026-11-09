import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { PromiseRow } from "@/components/home/PromiseRow";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SectionHeading } from "@/components/home/SectionHeading";
import {
  dealItems,
  featuredItems,
  itemsByCategory,
  listCategories,
  serviceItems,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [productCats, deals, fresh, build, electrical, featured, services, upholstery] = await Promise.all([
    listCategories("product"),
    dealItems(),
    itemsByCategory("fruits-veg"),
    itemsByCategory("build"),
    itemsByCategory("electrical"),
    featuredItems(),
    serviceItems(),
    itemsByCategory("sofa-cleaning"),
  ]);

  const highlights = [...featured, ...services].slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16">
      <Hero highlights={highlights} />
      <div className="relative z-10 -mt-2 sm:-mt-6">
        <PromiseRow />
      </div>
      <HowItWorks />
      {productCats.length ? (
        <section id="aisles" className="scroll-mt-24">
          <SectionHeading
            kicker="Aisles"
            title="Shop by aisle"
            subtitle="Amravati dark stores. One 15-minute clock."
          />
          <CategoryGrid categories={productCats} />
        </section>
      ) : null}
      <ProductRail
        kicker="Today"
        title="Lightning deals"
        subtitle="Cut prices, same scooter."
        href="/search?q=off"
        items={deals}
      />
        {
          upholstery.length ? (
            <ProductRail
              kicker="Doorstep Deep Clean"
              title="Sofa & Upholstery Cleaning"
              subtitle="Deep shampoo extraction, mattress sanitization, carpet washing & nano coating protection."
              href="/category/sofa-cleaning"
              items={upholstery}
            />
          ) : null
        }
      <ServiceStrip items={upholstery.length ? [...upholstery, ...services] : services} />
      <ProductRail
        kicker="Cold room"
        title="Fresh in 10"
        subtitle="Produce and dairy from the dark store."
        href="/category/fruits-veg"
        items={fresh.slice(0, 4)}
      />
      <ProductRail
        kicker="Build"
        title="Gitte Wale + hardware"
        subtitle="Gitti and sand by the cft or the truck. Cement and tools on the scooter."
        href="/category/build"
        items={[...build, ...electrical].slice(0, 8)}
      />
      <ProductRail kicker="Moving fast" title="Bestsellers" items={featured} />
      <ProductRail kicker="On demand" title="Book a pro" href="/services" items={services} />
    </div>
  );
}
