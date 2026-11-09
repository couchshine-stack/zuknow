"use client";

import { useEffect, useMemo, useState } from "react";
import { etaFromPoints, inDeliveryRange } from "@/lib/geo";
import { requestLiveEta } from "@/lib/eta-client";
import { useLocation } from "./LocationProvider";
import { useGeoConfig, usePublicConfig } from "@/components/config/PublicConfigProvider";
import type { CatalogItem } from "@/data/catalog";

export function CartEta({ items }: { items: Array<{ product: CatalogItem }> }) {
  const { location } = useLocation();
  const geo = useGeoConfig();
  const { cityName } = usePublicConfig();
  const dests = useMemo(
    () =>
      items.map((line) => ({
        fallback: line.product.etaMinutes,
        dest:
          line.product.sellerLat != null && line.product.sellerLng != null
            ? { lat: line.product.sellerLat, lng: line.product.sellerLng }
            : null,
      })),
    [items],
  );
  const estimate = Math.max(
    6,
    ...dests.map((row) => etaFromPoints(location, row.dest, row.fallback, geo).minutes),
  );
  const [minutes, setMinutes] = useState(estimate);
  const [inRange, setInRange] = useState(true);

  useEffect(() => {
    if (!location) {
      setMinutes(estimate);
      setInRange(true);
      return;
    }
    let cancelled = false;
    Promise.all(
      dests.map(async (row) => {
        if (!row.dest) return { minutes: row.fallback, km: null as number | null };
        const live = await requestLiveEta(location, row.dest);
        const fallback = etaFromPoints(location, row.dest, row.fallback, geo);
        return { minutes: live?.minutes ?? fallback.minutes, km: live?.km ?? fallback.km };
      }),
    ).then((rows) => {
      if (cancelled) return;
      setMinutes(Math.max(6, ...rows.map((row) => row.minutes)));
      setInRange(rows.every((row) => row.km == null || inDeliveryRange(row.km, geo.maxDeliveryKm)));
    });
    return () => {
      cancelled = true;
    };
  }, [location, dests, estimate, geo]);

  if (!inRange) return <>These items are outside the 15-minute zone. Pick a {cityName} pin in the header.</>;
  return <>Farthest item arrives in about {minutes} min.</>;
}
