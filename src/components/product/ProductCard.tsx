import Image from "next/image";
import Link from "next/link";
import { DeliveryEta } from "@/components/location/DeliveryEta";
import type { CatalogItem } from "@/data/catalog";
import { formatInr } from "@/lib/utils";
import { QtyControl } from "./QtyControl";

export function ProductCard({ item }: { item: CatalogItem }) {
  const href = item.kind === "service" ? `/service/${item.slug}` : `/product/${item.slug}`;
  const off = item.mrp && item.mrp > item.price ? Math.round((1 - item.price / item.mrp) * 100) : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-900/[0.05] bg-white p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/60 hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.08)]">
      {/* Product Image Stage */}
      <Link
        href={href}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F8FAFC]"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, 240px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Top Badges */}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md">
            <DeliveryEta sellerLat={item.sellerLat} sellerLng={item.sellerLng} fallback={item.etaMinutes} />
          </span>
          {off > 0 ? (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 backdrop-blur-md">
              Save {off}%
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3 pt-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {item.unit}
        </span>

        <Link
          href={href}
          className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-[#1D1D1F] transition-colors group-hover:text-black"
        >
          {item.name}
        </Link>

        {/* Price & Action Row */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <span className="font-display text-base font-extrabold text-[#1D1D1F]">
              {formatInr(item.price)}
            </span>
            {item.mrp && item.mrp > item.price ? (
              <span className="ml-1.5 text-xs font-medium text-slate-400 line-through">
                {formatInr(item.mrp)}
              </span>
            ) : null}
          </div>
          <QtyControl id={item.id} />
        </div>
      </div>
    </article>
  );
}
