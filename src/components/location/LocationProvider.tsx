"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { GeoPoint } from "@/lib/geo";

export type UserLocation = GeoPoint & { label: string; source: "gps" | "search" };

type LocationContextValue = {
  location: UserLocation | null;
  locating: boolean;
  error: string;
  setLocation: (loc: UserLocation) => void;
  detect: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);
const STORAGE_KEY = "zk_geo";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const setLocation = useCallback((loc: UserLocation) => {
    setLocationState(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Location is not available on this device.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let label = "Your location";
        try {
          const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
          const data = (await res.json()) as { label?: string };
          if (data.label) label = data.label;
        } catch {
          /* keep fallback label */
        }
        setLocation({ lat, lng, label, source: "gps" });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(err.code === 1 ? "Allow location to see delivery time." : "Could not read GPS.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, [setLocation]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserLocation;
        if (parsed.lat && parsed.lng) {
          setLocationState(parsed);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    detect();
  }, [detect]);

  const value = useMemo(
    () => ({ location, locating, error, setLocation, detect }),
    [location, locating, error, setLocation, detect],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
