"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { usePublicConfig } from "@/components/config/PublicConfigProvider";

type GoogleMapsNs = {
  maps: {
    Map: new (el: HTMLElement, opts: object) => { setCenter: (p: { lat: number; lng: number }) => void };
    Marker: new (opts: object) => { setPosition: (p: { lat: number; lng: number }) => void };
    Geocoder: new () => {
      geocode: (
        req: { location?: { lat: number; lng: number }; address?: string },
        cb: (results: Array<{ formatted_address?: string }> | null, status: string) => void,
      ) => void;
    };
    event: { addListener: (map: unknown, name: string, cb: (e: { latLng: { lat: () => number; lng: () => number } }) => void) => void };
  };
};

export function SellerMapPicker({
  lat,
  lng,
  address,
}: {
  lat?: number | null;
  lng?: number | null;
  address?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { googleMapsBrowserKey: key, cityLat, cityLng } = usePublicConfig();
  const [coords, setCoords] = useState({
    lat: lat ?? cityLat,
    lng: lng ?? cityLng,
  });
  const [label, setLabel] = useState(address || "");

  useEffect(() => {
    if (!key || !mapRef.current) return;
    loadGoogleMaps(key).then(() => {
      if (!mapRef.current) return;
      const google = (window as unknown as { google: GoogleMapsNs }).google;
      const map = new google.maps.Map(mapRef.current, {
        zoom: 14,
        center: coords,
        disableDefaultUI: true,
        zoomControl: true,
      });
      const marker = new google.maps.Marker({ map, position: coords, draggable: true });
      const geocoder = new google.maps.Geocoder();
      const onPick = (latlng: { lat: number; lng: number }) => {
        setCoords(latlng);
        marker.setPosition(latlng);
        map.setCenter(latlng);
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === "OK" && results?.[0]?.formatted_address) {
            setLabel(results[0].formatted_address);
          }
        });
      };
      google.maps.event.addListener(map, "click", (e) => {
        onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
      google.maps.event.addListener(marker, "dragend", (e) => {
        onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    });
  }, [key]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Shop pin (Google Maps)</p>
      <input type="hidden" name="lat" value={coords.lat} />
      <input type="hidden" name="lng" value={coords.lng} />
      <input type="hidden" name="geocodedAddress" value={label} />
      {key ? (
        <div ref={mapRef} className="h-56 w-full rounded-2xl bg-zk-mist ring-1 ring-zk-line" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="latDisplay"
            type="number"
            step="0.000001"
            value={coords.lat}
            onChange={(e) => setCoords((c) => ({ ...c, lat: Number(e.target.value) }))}
            className="input"
            placeholder="Latitude"
          />
          <input
            name="lngDisplay"
            type="number"
            step="0.000001"
            value={coords.lng}
            onChange={(e) => setCoords((c) => ({ ...c, lng: Number(e.target.value) }))}
            className="input"
            placeholder="Longitude"
          />
          <p className="sm:col-span-2 text-xs text-zk-ink/50">
            Add a Google Maps key in Admin → Settings to drop a pin. For now enter coordinates.
          </p>
        </div>
      )}
      <p className="text-xs text-zk-ink/50">
        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        {label ? ` · ${label}` : ""}
      </p>
    </div>
  );
}
