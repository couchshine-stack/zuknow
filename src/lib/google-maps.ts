import { estimateEtaMinutes, haversineKm, type GeoConfig, type GeoPoint } from "./geo";
import { getSettings } from "./settings";

type MatrixRow = {
  id: string;
  minutes: number;
  km: number;
  source: "google" | "estimate";
};

async function mapsCredentials() {
  const settings = await getSettings();
  const key = settings.googleMapsServerKey || settings.googleMapsBrowserKey;
  const geo: GeoConfig = {
    packMinutes: settings.packMinutes,
    scooterKmh: settings.scooterKmh,
    maxDeliveryKm: settings.maxDeliveryKm,
    cityLat: settings.cityLat,
    cityLng: settings.cityLng,
    cityRadiusKm: settings.cityRadiusKm,
  };
  return { key, geo, settings };
}

export async function distanceMatrix(origin: GeoPoint, destinations: Array<GeoPoint & { id: string }>): Promise<MatrixRow[]> {
  const { key, geo } = await mapsCredentials();
  if (!key || destinations.length === 0) {
    return destinations.map((dest) => {
      const km = haversineKm(origin, dest);
      return { id: dest.id, km, minutes: estimateEtaMinutes(km, geo), source: "estimate" as const };
    });
  }

  const params = new URLSearchParams({
    origins: `${origin.lat},${origin.lng}`,
    destinations: destinations.map((d) => `${d.lat},${d.lng}`).join("|"),
    mode: "driving",
    units: "metric",
    departure_time: "now",
    key,
  });

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      status?: string;
      rows?: Array<{
        elements?: Array<{
          status?: string;
          duration?: { value: number };
          duration_in_traffic?: { value: number };
          distance?: { value: number };
        }>;
      }>;
    };
    const elements = data.rows?.[0]?.elements || [];
    return destinations.map((dest, i) => {
      const el = elements[i];
      if (!el || el.status !== "OK") {
        const km = haversineKm(origin, dest);
        return { id: dest.id, km, minutes: estimateEtaMinutes(km, geo), source: "estimate" as const };
      }
      const seconds = el.duration_in_traffic?.value ?? el.duration?.value ?? 0;
      const km = (el.distance?.value ?? 0) / 1000;
      return {
        id: dest.id,
        km,
        minutes: Math.max(6, Math.round(seconds / 60) + geo.packMinutes),
        source: "google" as const,
      };
    });
  } catch {
    return destinations.map((dest) => {
      const km = haversineKm(origin, dest);
      return { id: dest.id, km, minutes: estimateEtaMinutes(km, geo), source: "estimate" as const };
    });
  }
}

export async function reverseGeocode(point: GeoPoint) {
  const { key } = await mapsCredentials();
  if (!key) return "Your location";
  const params = new URLSearchParams({
    latlng: `${point.lat},${point.lng}`,
    key,
  });
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { cache: "no-store" });
    const data = (await res.json()) as { results?: Array<{ formatted_address?: string }>; status?: string };
    return data.results?.[0]?.formatted_address || "Your location";
  } catch {
    return "Your location";
  }
}

export async function searchPlaces(query: string) {
  const { key } = await mapsCredentials();
  if (!key || query.trim().length < 3) return [];
  const params = new URLSearchParams({
    address: query,
    region: "in",
    key,
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { cache: "no-store" });
  const data = (await res.json()) as {
    results?: Array<{
      formatted_address: string;
      geometry?: { location?: { lat: number; lng: number } };
    }>;
  };
  return (data.results || []).slice(0, 6).map((row) => ({
    label: row.formatted_address,
    lat: row.geometry?.location?.lat ?? 0,
    lng: row.geometry?.location?.lng ?? 0,
  }));
}
