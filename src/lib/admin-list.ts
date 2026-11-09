export const ADMIN_PAGE_SIZE = 20;

export function parseAdminPage(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseAdminQuery(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value || "").trim();
}

export function adminPageCount(total: number, size = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, total) / size));
}

export function adminHref(path: string, params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    if (/page$/i.test(key) && Number(value) <= 1) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export function mergeWhere<T extends object>(parts: Array<T | Record<string, never> | undefined>) {
  const cleaned = parts.filter((part): part is T => Boolean(part && Object.keys(part).length));
  if (!cleaned.length) return undefined;
  if (cleaned.length === 1) return cleaned[0];
  return { AND: cleaned } as T;
}

export function clampAdminPage(page: number, total: number, size = ADMIN_PAGE_SIZE) {
  const last = adminPageCount(total, size);
  return Math.min(Math.max(1, page), last);
}
