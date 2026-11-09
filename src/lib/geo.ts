export type GeoPoint = { lat: number; lng: number };

export type GeoConfig = {
  packMinutes: number;
  scooterKmh: number;
  maxDeliveryKm: number;
  cityLat: number;
  cityLng: number;
  cityRadiusKm: number;
};

export const DEFAULT_GEO: GeoConfig = {
  packMinutes: 4,
  scooterKmh: 22,
  maxDeliveryKm: 12,
  cityLat: 20.9374,
  cityLng: 77.7796,
  cityRadiusKm: 12,
};

/** @deprecated use geo.maxDeliveryKm */
export const MAX_DELIVERY_KM = DEFAULT_GEO.maxDeliveryKm;
export const MUMBAI_CENTER: GeoPoint = { lat: DEFAULT_GEO.cityLat, lng: DEFAULT_GEO.cityLng };
export const CITY_RADIUS_KM = DEFAULT_GEO.cityRadiusKm;

export function cleanMapsKey(value?: string | null) {
  return (value || "").trim().replace(/^["']|["']$/g, "");
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(from: GeoPoint, to: GeoPoint) {
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function estimateEtaMinutes(km: number, geo: GeoConfig = DEFAULT_GEO) {
  const ride = (km / geo.scooterKmh) * 60;
  return Math.max(6, Math.min(90, Math.round(geo.packMinutes + ride)));
}

export function inDeliveryRange(km: number | null | undefined, maxKm: number = DEFAULT_GEO.maxDeliveryKm) {
  return km != null && km <= maxKm;
}

export function isInServiceCity(point: GeoPoint | null | undefined, geo: GeoConfig = DEFAULT_GEO) {
  if (!point) return false;
  return haversineKm(point, { lat: geo.cityLat, lng: geo.cityLng }) <= geo.cityRadiusKm;
}

export function etaFromPoints(
  from: GeoPoint | null,
  to: GeoPoint | null,
  fallback = 15,
  geo: GeoConfig = DEFAULT_GEO,
) {
  if (!from || !to) {
    return { minutes: fallback, km: null as number | null, inRange: true, source: "fallback" as const };
  }
  const km = haversineKm(from, to);
  return {
    minutes: estimateEtaMinutes(km, geo),
    km,
    inRange: inDeliveryRange(km, geo.maxDeliveryKm),
    source: "estimate" as const,
  };
}

export function mapsKey() {
  return cleanMapsKey(process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export function publicMapsKey() {
  return cleanMapsKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}
