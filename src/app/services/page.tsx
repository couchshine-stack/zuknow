export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ProductRail } from "@/components/home/ProductRail";
import { serviceItems, itemsByCategory } from "@/lib/catalog";
import { Sparkles, ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = { 
  title: "On-Demand Doorstep Services · Sofa Cleaning & Home Pros | zuknow.in",
  description: "Book verified local experts in Amravati. Sofa deep cleaning, electricians, plumbers, and home cooks with instant dispatch."
};

export default async function ServicesPage() {
  const [allServices, upholstery] = await Promise.all([
    serviceItems(),
    itemsByCategory("sofa-cleaning"),
  ]);

  const homeMaintenance = allServices.filter(
    (s) => s.category === "electrician" || s.category === "plumber" || s.category === "carpenter" || s.category === "painter"
  );
  const homeCooking = allServices.filter((s) => s.category === "home-cook");

  return (
    <div className="space-y-12">
      {/* Apple Keynote Services Header */}
      <header className="relative overflow-hidden rounded-[2.5rem] border border-slate-900/[0.06] bg-gradient-to-b from-white via-[#FAFBFD] to-[#F4F6FA] p-8 shadow-apple-card sm:p-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-sky-100/30 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/[0.06] bg-white/90 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-apple-subtle backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Doorstep Specialists · Verified & Background-Checked</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.03em] text-[#1D1D1F] sm:text-5xl sm:leading-[1.1]">
            Verified experts. Deep cleaning. <br />
            <span className="text-slate-600">Delivered in 15 minutes.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            From professional sofa & upholstery deep shampooing to certified electricians and home cooks — one seamless Razorpay checkout.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm border border-slate-200/80">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              15-minute dispatch clock
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm border border-slate-200/80">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Eco-friendly & pet safe
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm border border-slate-200/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              100% verified specialists
            </span>
          </div>
        </div>
      </header>

      {/* Upholstery Cleaning Spotlight */}
      {upholstery.length ? (
        <ProductRail
          kicker="Doorstep Deep Clean"
          title="Sofa & Furniture Deep Cleaning"
          subtitle="Deep shampoo extraction, mattress sanitization, carpet washing & nano coating protection."
          items={upholstery}
        />
      ) : null}

      {/* Home Maintenance & Repairs */}
      {homeMaintenance.length ? (
        <ProductRail
          kicker="Home Repairs"
          title="Electricians, Plumbers & Carpenters"
          subtitle="Verified tools, fair pricing, and immediate dispatch."
          items={homeMaintenance}
        />
      ) : null}

      {/* Daily Services */}
      {homeCooking.length ? (
        <ProductRail
          kicker="Kitchen"
          title="Home Cooking & Meals"
          subtitle="Fresh home-cooked breakfast and dinner at your table."
          items={homeCooking}
        />
      ) : null}
    </div>
  );
}
