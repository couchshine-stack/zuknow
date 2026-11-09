export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseOptionalPercent(raw: FormDataEntryValue | null) {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}
