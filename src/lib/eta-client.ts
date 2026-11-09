import type { GeoPoint } from "./geo";

export type LiveEta = { minutes: number; km: number; source: "google" | "estimate" };

const cache = new Map<string, LiveEta>();

type Waiter = {
  origin: GeoPoint;
  dest: { id: string; lat: number; lng: number };
  resolve: (row: LiveEta | null) => void;
};

let queue: Waiter[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function etaCacheKey(origin: GeoPoint, dest: GeoPoint) {
  return `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}|${dest.lat.toFixed(5)},${dest.lng.toFixed(5)}`;
}

export function requestLiveEta(origin: GeoPoint, dest: GeoPoint): Promise<LiveEta | null> {
  const id = etaCacheKey(origin, dest);
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);

  return new Promise((resolve) => {
    queue.push({ origin, dest: { id, lat: dest.lat, lng: dest.lng }, resolve });
    if (timer) clearTimeout(timer);
    timer = setTimeout(flushEtaQueue, 50);
  });
}

async function flushEtaQueue() {
  timer = null;
  const batch = queue;
  queue = [];
  if (!batch.length) return;

  const groups = new Map<string, Waiter[]>();
  for (const waiter of batch) {
    const key = `${waiter.origin.lat},${waiter.origin.lng}`;
    const list = groups.get(key) || [];
    list.push(waiter);
    groups.set(key, list);
  }

  await Promise.all([...groups.values()].map(flushGroup));
}

async function flushGroup(group: Waiter[]) {
  const origin = group[0].origin;
  const destinations = [...new Map(group.map((row) => [row.dest.id, row.dest])).values()];

  try {
    const res = await fetch("/api/geo/eta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destinations }),
    });
    const data = (await res.json()) as { results?: Array<LiveEta & { id: string }> };
    for (const row of data.results || []) {
      cache.set(row.id, { minutes: row.minutes, km: row.km, source: row.source });
    }
  } catch {
    /* callers keep the local estimate */
  }

  for (const waiter of group) {
    waiter.resolve(cache.get(waiter.dest.id) ?? null);
  }
}
