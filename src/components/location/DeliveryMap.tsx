"use client";

import { useEffect, useRef, useState } from "react";
import { useLocation } from "./LocationProvider";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { etaFromPoints, inDeliveryRange } from "@/lib/geo";
import { useGeoConfig, usePublicConfig } from "@/components/config/PublicConfigProvider";

export function DeliveryMap({
  sellerLat,
  sellerLng,
  sellerName,
  fallbackMinutes = 15,
}: {
  sellerLat?: number | null;
  sellerLng?: number | null;
  sellerName?: string;
  fallbackMinutes?: number;
}) {
  const { location, detect } = useLocation();
  const geo = useGeoConfig();
  const { googleMapsBrowserKey: key, cityName } = usePublicConfig();
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [googleEta, setGoogleEta] = useState<{ minutes: number; km: number } | null>(null);
  const dest = sellerLat != null && sellerLng != null ? { lat: sellerLat, lng: sellerLng } : null;
  const estimate = etaFromPoints(location, dest, fallbackMinutes, geo);
  const km = googleEta?.km ?? estimate.km;
  const minutes = googleEta?.minutes ?? estimate.minutes;
  const inRange = km == null ? true : inDeliveryRange(km, geo.maxDeliveryKm);

  useEffect(() => {
    setGoogleEta(null);
    setReady(false);
    setMapError("");
    if (!key || !mapRef.current || !dest) return;
    let cancelled = false;
    loadGoogleMaps(key)
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const google = (window as unknown as { google: GoogleMapsNs }).google;
        const map = new google.maps.Map(mapRef.current, {
          zoom: 13,
          center: location && inDeliveryRange(estimate.km, geo.maxDeliveryKm) ? location : dest,
          disableDefaultUI: true,
          zoomControl: true,
        });
        new google.maps.Marker({
          map,
          position: dest,
          title: sellerName || "Seller",
          label: "Z",
        });
        if (location) {
          new google.maps.Marker({
            map,
            position: location,
            title: "You",
            label: "You",
          });
        }
        const nearby = location && inDeliveryRange(etaFromPoints(location, dest, fallbackMinutes, geo).km, geo.maxDeliveryKm);
        if (location && nearby) {
          const directions = new google.maps.DirectionsService();
          const renderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#163A8C", strokeWeight: 5 },
          });
          directions.route(
            {
              origin: location,
              destination: dest,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK" && result) {
                renderer.setDirections(result);
                const leg = result.routes[0]?.legs[0];
                if (leg?.duration?.value) {
                  setGoogleEta({
                    minutes: Math.max(6, Math.round(leg.duration.value / 60) + geo.packMinutes),
                    km: (leg.distance?.value || 0) / 1000,
                  });
                }
              }
            },
          );
        } else if (location) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(location);
          bounds.extend(dest);
          map.fitBounds(bounds, 48);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setMapError("Could not load Google Maps. Check the API key and enabled APIs.");
      });
    return () => {
      cancelled = true;
    };
  }, [key, location, dest?.lat, dest?.lng, sellerName, estimate.km, geo.maxDeliveryKm, geo.packMinutes, fallbackMinutes]);

  return (
    <div className="overflow-hidden rounded-[1.5rem] ring-1 ring-zk-line">
      <div className="flex items-center justify-between gap-3 bg-zk-navy px-4 py-3 text-white">
        <div>
          <p className="text-xs uppercase tracking-wide text-zk-orange">
            Delivery from {sellerName || "dark store"}
          </p>
          <p className="font-display text-lg font-extrabold">
            {!location
              ? "Share location for time"
              : inRange
                ? `${minutes} min${km != null ? ` · ${km.toFixed(1)} km` : ""}`
                : `Outside ${geo.maxDeliveryKm} km zone`}
          </p>
        </div>
        {!location ? (
          <button onClick={detect} className="shrink-0 rounded-full bg-zk-orange px-3 py-1.5 text-xs font-bold">
            Share location
          </button>
        ) : null}
      </div>
      {key && dest ? (
        <div ref={mapRef} className="h-64 w-full bg-zk-mist" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-zk-mist px-4 text-center text-sm text-zk-ink/60">
          {dest
            ? location
              ? "Map is loading…"
              : "Share your location to see the route to this store."
            : "This seller has no map pin yet."}
        </div>
      )}
      <p className="bg-white px-4 py-2 text-xs text-zk-ink/50">
        {mapError
          ? mapError
          : !location
            ? "Allow location, or pick a delivery area in the header."
            : inRange
              ? `Time includes packing plus scooter time${googleEta ? " (Google Maps)." : " (estimated)."}`
              : `This pin is too far for 15-minute delivery. Search an area in ${cityName}.`}
      </p>
    </div>
  );
}

type GoogleMapsNs = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: object,
    ) => { fitBounds: (b: unknown, padding?: number) => void };
    Marker: new (opts: object) => unknown;
    LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
    DirectionsService: new () => {
      route: (
        req: object,
        cb: (result: DirectionsResult | null, status: string) => void,
      ) => void;
    };
    DirectionsRenderer: new (opts: object) => { setDirections: (r: DirectionsResult) => void };
    TravelMode: { DRIVING: string };
  };
};

type DirectionsResult = {
  routes: Array<{
    legs: Array<{ duration?: { value: number }; distance?: { value: number } }>;
  }>;
};
