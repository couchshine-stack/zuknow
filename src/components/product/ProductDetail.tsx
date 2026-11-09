import Image from "next/image";
import Link from "next/link";
import { Check, Clock, MapPin, RotateCcw, ShieldCheck, Store, Truck, Wallet } from "lucide-react";
import type { CatalogItem, Category } from "@/data/catalog";
import { formatInr } from "@/lib/utils";
import { productDetail } from "@/lib/product-copy";
import { QtyControl } from "./QtyControl";
import { DeliveryEta } from "@/components/location/DeliveryEta";
import { DeliveryMap } from "@/components/location/DeliveryMap";
import { ProductRail } from "@/components/home/ProductRail";

export function ProductDetail({
  item,
  aisle,
  related,
}: {
  item: CatalogItem;
  aisle?: Category | null;
  related: CatalogItem[];
}) {
  const detail = productDetail(item);
  const off = item.mrp && item.mrp > item.price ? Math.round((1 - item.price / item.mrp) * 100) : 0;
  const hrefAisle = aisle ? `/category/${aisle.slug}` : item.kind === "service" ? "/services" : "/categories";
  const aisleName = aisle?.name || item.categoryName || (item.kind === "service" ? "Services" : "Aisle");
  const yard = item.tags.includes("gitti-wale") || item.tags.includes("truck");

  return (
    <div className="space-y-10">
      <nav className="text-xs sm:text-sm font-medium text-slate-500">
        <Link href="/" className="hover:text-zk-blue transition-colors">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link href={hrefAisle} className="hover:text-zk-blue transition-colors">
          {aisleName}
        </Link>
        <span className="px-2">/</span>
        <span className="text-slate-900 font-semibold">{item.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-apple-card ring-1 ring-slate-900/[0.06]">
            <Image src={item.image} alt={item.name} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            {off > 0 ? (
              <span className="absolute left-4 top-4 rounded-full bg-zk-orange px-3 py-1 text-xs font-extrabold text-white shadow-sm ring-1 ring-white/20">
                {off}% off
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Clock, label: `${item.etaMinutes} min clock` },
              { icon: Store, label: item.sellerName?.split("·")[0]?.trim() || "Dark store" },
              { icon: ShieldCheck, label: "Pay on Razorpay" },
              { icon: Truck, label: yard ? "Tipper from Camp" : "Scooter from Amravati" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl bg-white px-3 py-3 text-center shadow-apple-subtle ring-1 ring-slate-900/[0.05]">
                <Icon className="mx-auto h-4 w-4 text-zk-orange" />
                <p className="mt-1 text-[11px] font-semibold leading-tight text-slate-800">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zk-navy px-3 py-1 text-xs font-bold text-white shadow-sm">
            <DeliveryEta
              sellerLat={item.sellerLat}
              sellerLng={item.sellerLng}
              fallback={item.etaMinutes}
              showDistance
              className="text-white"
            />{" "}
            {item.kind === "service" ? "to door" : yard ? "tipper to plot" : "delivery"}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{item.name}</h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
            {item.unit}
            {item.sellerName ? ` · ${item.sellerName}` : ""}
            {item.sellerAddress ? ` · ${item.sellerAddress}` : ""}
          </p>
          {item.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-zk-blue ring-1 ring-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700">{item.blurb}</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">{formatInr(item.price)}</p>
            {item.mrp ? <p className="text-lg text-slate-400 line-through font-medium">{formatInr(item.mrp)}</p> : null}
            {off > 0 ? <p className="text-xs sm:text-sm font-bold text-zk-orange">You save {formatInr(item.mrp! - item.price)}</p> : null}
          </div>
          <p className={`mt-2 text-xs sm:text-sm font-semibold ${detail.outOfStock ? "text-red-600" : detail.lowStock ? "text-zk-orange" : "text-emerald-700"}`}>
            {detail.stockLabel}
          </p>
          <div className="mt-5">
            {detail.outOfStock ? (
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">This line is not live in the dark store right now.</p>
            ) : (
              <QtyControl
                id={item.id}
                addLabel={item.kind === "service" ? "Book this visit" : "Add to cart"}
                className="h-11 min-w-[180px] justify-center px-6 text-sm font-semibold shadow-apple-card"
              />
            )}
          </div>
          <ul className="mt-6 space-y-2">
            {detail.highlights.map((line) => (
              <li key={line} className="flex gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-zk-orange" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {detail.policies.map((row) => (
              <div key={row.title} className="rounded-2xl bg-slate-100/80 px-3.5 py-3 ring-1 ring-slate-900/[0.04]">
                <p className="text-xs font-bold text-slate-900">{row.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-600">{row.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-apple-card ring-1 ring-slate-900/[0.05] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zk-orange">About this item</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">What you are buying</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{detail.about}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-apple-card ring-1 ring-slate-900/[0.05] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zk-orange">Specifications</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">Pack and shop</h2>
          <dl className="mt-4 divide-y divide-slate-100">
            {detail.specs.map((row) => (
              <div key={row.label} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 text-sm">
                <dt className="font-semibold text-zk-ink/50">{row.label}</dt>
                <dd className="font-medium text-zk-navy">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DeliveryMap
          sellerLat={item.sellerLat}
          sellerLng={item.sellerLng}
          sellerName={item.sellerName}
          fallbackMinutes={item.etaMinutes}
        />
        <div className="rounded-[2rem] bg-zk-navy p-6 text-white sm:p-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zk-orange">
            <MapPin className="h-3.5 w-3.5" />
            How it reaches you
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">
            {item.kind === "service" ? "A pro, not a parcel" : yard ? "Yard to plot" : "Dark store to door"}
          </h2>
          <ol className="mt-5 space-y-4 text-sm text-white/80">
            <li>
              <span className="font-bold text-zk-orange">01 · </span>
              We confirm the pin in your header. Too far shows before you pay.
            </li>
            <li>
              <span className="font-bold text-zk-orange">02 · </span>
              {item.kind === "service"
                ? "The crew packs a kit bag at the shop on this map."
                : yard
                  ? "The tipper is loaded at Camp Gitte Wale — 20mm, 40mm, sand, murum or bricks."
                  : "This SKU is picked from the rack at the shop on this map."}
            </li>
            <li>
              <span className="font-bold text-zk-orange">03 · </span>
              {yard
                ? "A tipper follows the Google route and dumps at your gate. Clock includes loading."
                : "A scooter (or the pro) follows the Google route. Time includes packing."}
            </li>
          </ol>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: RotateCcw,
            title: item.kind === "service" ? "Change of plan" : yard ? "After the dump" : "Returns & replacement",
            body:
              item.kind === "service"
                ? "Cancel before the pro is dispatched. After they leave, the visit fee stands."
                : yard
                  ? "Dumped gitti, sand or murum cannot come back. Call out the wrong grade before unload."
                  : "Unopened packs same day. Wrong, damaged, or dead-on-arrival lines replaced or refunded.",
          },
          {
            icon: Wallet,
            title: "Payment",
            body: "Razorpay at checkout — UPI, cards, netbanking. Guest checkout unless admin turns it off.",
          },
          {
            icon: Store,
            title: item.sellerName || "Dark store",
            body: item.sellerAddress
              ? `Packed / dispatched from ${item.sellerAddress}. Time on the map includes packing.`
              : "Packed at the nearest live Amravati dark store.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-[1.6rem] bg-white p-5 ring-1 ring-zk-line">
            <Icon className="h-5 w-5 text-zk-orange" />
            <h3 className="mt-3 font-display text-lg font-extrabold text-zk-navy">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zk-ink/65">{body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 ring-1 ring-zk-line sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zk-orange">Help</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-zk-navy">Questions about this {item.kind === "service" ? "visit" : "item"}</h2>
        <div className="mt-5 divide-y divide-zk-line">
          {detail.faqs.map((row) => (
            <details key={row.q} className="group py-3">
              <summary className="cursor-pointer list-none font-semibold text-zk-navy marker:content-none">
                {row.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zk-ink/65">{row.a}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length ? (
        <ProductRail
          kicker={related.every((row) => row.category === item.category) ? "Same aisle" : "Around Amravati"}
          title={related.every((row) => row.category === item.category) ? "Often bought with" : "Also on zuknow"}
          href={hrefAisle}
          items={related}
        />
      ) : null}
    </div>
  );
}
