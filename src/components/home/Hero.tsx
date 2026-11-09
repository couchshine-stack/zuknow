"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bike, Sparkles, ShieldCheck, Zap } from "lucide-react";
import type { CatalogItem } from "@/data/catalog";
import { formatInr } from "@/lib/utils";

const QUICK_TAGS = ["Fresh Bananas", "Cold Milk", "PPC Cement", "Power Bank", "Electrician"];

export function Hero({ highlights = [] }: { highlights?: CatalogItem[] }) {
  const freshItem = highlights.find((h) => h.category === "fruits-veg") || highlights[0];
  const dairyItem = highlights.find((h) => h.category === "dairy") || highlights[1] || highlights[0];
  const buildItem = highlights.find((h) => h.category === "build" || h.kind === "service") || highlights[2] || highlights[0];

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-900/[0.06] bg-gradient-to-b from-white via-[#FAFBFD] to-[#F4F6FA] p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] sm:p-12 lg:p-16">
      {/* Apple ambient soft radial atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-200/25 via-orange-100/20 to-transparent blur-3xl" />
        <div className="absolute -right-20 top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-sky-200/25 via-blue-100/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-100/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/[0.06] bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-apple-subtle backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="tracking-tight text-slate-700">15-Minute City Delivery Live in Amravati</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-bold">Dark Stores Active</span>
        </div>

        {/* Apple Headline */}
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-[-0.03em] text-[#1D1D1F] sm:text-6xl sm:leading-[1.08] lg:text-7xl">
          Superfast. Super fresh. <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
            At your door in 15 minutes.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
          Farm-fresh groceries, construction hardware, electricals, and verified local experts — dispatched in minutes from neighborhood dark stores.
        </p>

        {/* Apple Capsule CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="#aisles"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1D1D1F] px-8 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-black hover:shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <span>Explore Aisles</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-7 text-sm font-semibold text-slate-800 shadow-apple-subtle backdrop-blur-md transition-all duration-200 hover:bg-slate-50 hover:shadow-apple-card hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Book Verified Pro</span>
          </Link>
        </div>

        {/* Quick Filter Tags */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Popular:</span>
          {QUICK_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-slate-900/[0.05] bg-white/90 px-3.5 py-1 text-xs font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-150 hover:border-slate-300 hover:bg-white hover:text-slate-900 active:scale-95"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Flagship Apple 3-Bento Showcase */}
      <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Bento 1: Fresh Daily Market */}
        {freshItem ? (
          <Link
            href={`/product/${freshItem.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-900/[0.06] bg-gradient-to-b from-white to-emerald-50/30 p-6 shadow-apple-card transition-all duration-300 hover:-translate-y-1 hover:shadow-apple-hover"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <Zap className="h-3 w-3" />
                Fresh Daily
              </span>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 backdrop-blur-md">
                10m delivery
              </span>
            </div>

            <div className="relative my-6 h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src={freshItem.image}
                alt={freshItem.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="font-display text-base font-bold text-slate-900">{freshItem.name}</p>
                <p className="text-xs text-slate-500">From local partner farms</p>
              </div>
              <span className="font-display text-lg font-extrabold text-slate-900">
                {formatInr(freshItem.price)}
              </span>
            </div>
          </Link>
        ) : null}

        {/* Bento 2: Dark Store Essentials (Center Stage) */}
        {dairyItem ? (
          <Link
            href={`/product/${dairyItem.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-900/[0.08] bg-gradient-to-b from-white via-white to-sky-50/40 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] ring-1 ring-sky-500/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-bold text-sky-800">
                <Bike className="h-3 w-3" />
                Rajapeth Dark Store
              </span>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                ⚡️ 12 mins
              </span>
            </div>

            <div className="relative my-6 h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src={dairyItem.image}
                alt={dairyItem.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-2 left-2 rounded-xl bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-md shadow-sm">
                Instant Dispatch
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="font-display text-base font-bold text-slate-900">{dairyItem.name}</p>
                <p className="text-xs text-slate-500">Guaranteed in-stock dark store</p>
              </div>
              <span className="font-display text-lg font-extrabold text-slate-900">
                {formatInr(dairyItem.price)}
              </span>
            </div>
          </Link>
        ) : null}

        {/* Bento 3: Build & Verified Home Pros */}
        {buildItem ? (
          <Link
            href={buildItem.kind === "service" ? `/service/${buildItem.slug}` : `/product/${buildItem.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-900/[0.06] bg-gradient-to-b from-white to-amber-50/30 p-6 shadow-apple-card transition-all duration-300 hover:-translate-y-1 hover:shadow-apple-hover sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-800">
                <ShieldCheck className="h-3 w-3" />
                Verified & Insured
              </span>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 backdrop-blur-md">
                Camp Hub
              </span>
            </div>

            <div className="relative my-6 h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src={buildItem.image}
                alt={buildItem.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-2 left-2 rounded-xl bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                ★ 4.9 Verified Experts
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="font-display text-base font-bold text-slate-900">{buildItem.name}</p>
                <p className="text-xs text-slate-500">Hardware & On-demand service</p>
              </div>
              <span className="font-display text-lg font-extrabold text-slate-900">
                {formatInr(buildItem.price)}
              </span>
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
