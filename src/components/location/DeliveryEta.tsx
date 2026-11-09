"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { etaFromPoints, inDeliveryRange } from "@/lib/geo";
import { requestLiveEta, type LiveEta } from "@/lib/eta-client";
import { useLocation } from "@/components/location/LocationProvider";
import { useGeoConfig } from "@/components/config/PublicConfigProvider";
import { cn } from "@/lib/utils";

export function DeliveryEta({
  sellerLat,
  sellerLng,
  fallback = 15,
  className,
  showDistance = false,
}: {
  sellerLat?: number | null;
  sellerLng?: number | null;
  fallback?: number;
  className?: string;
  showDistance?: boolean;
}) {
  const { location, locating } = useLocation();
  const geo = useGeoConfig();
  const dest = sellerLat != null && sellerLng != null ? { lat: sellerLat, lng: sellerLng } : null;
  const estimate = etaFromPoints(location, dest, fallback, geo);
  const [live, setLive] = useState<LiveEta | null>(null);

  useEffect(() => {
    if (!location || !dest) {
      setLive(null);
      return;
    }
    let cancelled = false;
    requestLiveEta(location, dest).then((row) => {
      if (!cancelled && row) setLive(row);
    });
    return () => {
      cancelled = true;
    };
  }, [location, dest?.lat, dest?.lng]);

  const minutes = live?.minutes ?? estimate.minutes;
  const km = live?.km ?? estimate.km;
  const inRange = km == null || inDeliveryRange(km, geo.maxDeliveryKm);

  return (
    <span className={cn("inline-flex items-center gap-1 font-bold", className)}>
      <Clock className="h-3 w-3" />
      {locating && !location
        ? "Locating…"
        : !inRange
          ? "Too far"
          : `${minutes} min${showDistance && km != null ? ` · ${km.toFixed(1)} km` : ""}`}
    </span>
  );
}
