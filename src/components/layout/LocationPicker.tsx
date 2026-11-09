"use client";

import { MapPin, ChevronDown, Navigation, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "@/components/location/LocationProvider";
import { isInServiceCity } from "@/lib/geo";
import { useGeoConfig, usePublicConfig } from "@/components/config/PublicConfigProvider";

type Suggestion = { label: string; lat: number; lng: number };

const AMRAVATI_AREAS: Suggestion[] = [
  { label: "Rajapeth", lat: 20.9254, lng: 77.7586 },
  { label: "Camp", lat: 20.9378, lng: 77.7612 },
  { label: "Jaistambh Chowk", lat: 20.9326, lng: 77.7525 },
  { label: "Sai Nagar", lat: 20.9585, lng: 77.7874 },
];

export function LocationPicker() {
  const { location, locating, error, detect, setLocation } = useLocation();
  const geo = useGeoConfig();
  const { cityName } = usePublicConfig();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const far = Boolean(location && !isInServiceCity(location, geo));

  useEffect(() => {
    if (!open || query.trim().length < 3) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as { results?: Suggestion[] };
        setHits(data.results || []);
      } catch {
        setHits([]);
      }
      setSearching(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query, open]);

  const headerLabel = locating
    ? "Finding you…"
        : far
      ? location?.label && location.label !== "Your location"
        ? location.label
        : `Outside ${cityName}`
      : location?.label || "Set delivery location";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 max-w-[260px] items-center gap-2 rounded-full bg-slate-100/80 px-3.5 text-left ring-1 ring-slate-900/[0.08] transition-all duration-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zk-blue"
      >
        <MapPin className="h-4 w-4 shrink-0 text-zk-orange" />
        <span className="truncate text-xs font-semibold text-slate-800">{headerLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200" />
      </button>
      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl bg-white/95 p-3.5 shadow-apple-hover ring-1 ring-slate-900/[0.08] backdrop-blur-xl">
          {far ? (
            <p className="mb-2 rounded-xl bg-orange-50 px-2 py-2 text-xs font-medium text-zk-orange">
              GPS is outside our 15-minute {cityName} zone. Pick an area below to see real delivery time.
            </p>
          ) : null}
          <button
            onClick={() => {
              detect();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold text-zk-blue hover:bg-zk-mist"
          >
            <Navigation className="h-4 w-4" />
            Use my GPS location
          </button>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {AMRAVATI_AREAS.map((area) => (
              <button
                key={area.label}
                onClick={() => {
                  setLocation({ ...area, source: "search" });
                  setOpen(false);
                  setQuery("");
                }}
                className="rounded-full bg-zk-mist px-2.5 py-1 text-[11px] font-semibold text-zk-navy hover:bg-zk-navy hover:text-white"
              >
                {area.label}
              </button>
            ))}
          </div>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zk-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area, society, pin…"
              className="h-10 w-full rounded-xl border border-zk-line bg-zk-mist pl-9 pr-3 text-sm outline-none"
            />
          </div>
          {searching ? <p className="mt-2 text-xs text-zk-ink/50">Searching Google Maps…</p> : null}
          {hits.length ? (
            <ul className="mt-2 max-h-48 overflow-auto">
              {hits.map((hit) => (
                <li key={`${hit.lat}-${hit.lng}-${hit.label}`}>
                  <button
                    onClick={() => {
                      setLocation({ ...hit, source: "search" });
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-zk-mist"
                  >
                    {hit.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
          <p className="mt-2 text-[11px] text-zk-ink/45">Delivery time is from your pin to the seller dark store.</p>
        </div>
      ) : null}
    </div>
  );
}
