import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { CatalogItem } from "@/data/catalog";
import { formatInr } from "@/lib/utils";
import { QtyControl } from "@/components/product/QtyControl";
import { DeliveryEta } from "@/components/location/DeliveryEta";

export function ServiceStrip({ items }: { items: CatalogItem[] }) {
  if (!items.length) return null;
  const featured = items[0];
  const extras = items.slice(1, 3);
  const href = `/service/${featured.slug}`;

  return (
    <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.25rem] bg-gradient-to-br from-[#FFFFFF] via-[#F8FAFC] to-[#EFF4FA] text-slate-900 shadow-[0_12px_40px_-15px_rgba(15,23,42,0.07),0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.07]">
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-orange-400/10 via-amber-300/10 to-transparent blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gradient-to-bl from-blue-400/10 via-sky-300/10 to-transparent blur-[100px]" />
      
      <div className="grid lg:grid-cols-2">
        <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">On-Demand Specialists</span>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-[#1D1D1F] sm:text-4xl">
            Need a person, not a parcel?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            {featured.blurb} Same 15-minute clock as your grocery bag.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200/80">
              <Clock className="h-3.5 w-3.5 text-slate-600" />
              <DeliveryEta
                sellerLat={featured.sellerLat}
                sellerLng={featured.sellerLng}
                fallback={featured.etaMinutes}
                className="text-slate-700"
              />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200/80">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {formatInr(featured.price)} visit
            </span>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={href}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1D1D1F] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-black active:scale-95"
            >
              Book {featured.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex h-11 items-center rounded-full border border-slate-200/90 bg-white/90 px-5 text-sm font-semibold text-slate-800 shadow-apple-subtle backdrop-blur-md transition hover:bg-slate-50 hover:shadow-apple-card active:scale-95"
            >
              All Services
            </Link>
          </div>
        </div>

        <div className="relative min-h-[280px] sm:min-h-[340px]">
          <Image
            src={featured.image}
            alt={featured.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-2xl bg-white/95 p-3.5 text-slate-900 shadow-apple-hover border border-slate-200/80 backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-4">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Available in Amravati</span>
              <Link href={href} className="mt-1 block truncate font-display text-lg font-bold text-[#1D1D1F] hover:text-sky-600 transition-colors">
                {featured.name}
              </Link>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                {formatInr(featured.price)} · {featured.unit}
              </p>
            </div>
            <QtyControl id={featured.id} className="h-9 shrink-0 px-4" />
          </div>
        </div>
      </div>

      {extras.length ? (
        <div className="grid gap-3 border-t border-slate-200/60 bg-slate-50/60 p-4 sm:grid-cols-2 sm:px-6">
          {extras.map((item) => (
            <Link
              key={item.id}
              href={`/service/${item.slug}`}
              className="group flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 shadow-apple-subtle ring-1 ring-slate-900/[0.06] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-card active:scale-[0.98]"
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-900/10">
                <Image src={item.image} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="64px" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display font-bold text-sm text-slate-900 group-hover:text-zk-orange transition-colors">{item.name}</span>
                <span className="text-xs text-slate-500">{formatInr(item.price)} · {item.unit}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
