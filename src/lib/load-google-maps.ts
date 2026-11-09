"use client";

let mapsPromise: Promise<void> | null = null;
let loadedKey = "";

export function googleMapsBrowserKey() {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim().replace(/^["']|["']$/g, "");
}

export function loadGoogleMaps(apiKey?: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("window"));
  const key = (apiKey || googleMapsBrowserKey()).trim();
  if (!key) return Promise.reject(new Error("Google Maps key missing"));
  const g = window as Window & { google?: { maps?: unknown } };
  if (g.google?.maps && loadedKey === key) return Promise.resolve();
  if (mapsPromise && loadedKey === key) return mapsPromise;
  loadedKey = key;
  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-zk-maps]");
    if (existing && g.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.dataset.zkMaps = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("maps script"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}
