import { prisma } from "./db";
import { CATEGORIES, type CatalogItem, type Category, type ItemKind } from "@/data/catalog";

const tintBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.tint]));

function withTint(c: { slug: string; name: string; tagline: string; emoji: string; tint: string }): Category {
  return {
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    emoji: c.emoji,
    tint: tintBySlug[c.slug] || c.tint,
  };
}

export function mapProduct(p: {
  id: string;
  slug: string;
  name: string;
  unit: string;
  price: number;
  mrp: number | null;
  blurb: string;
  image: string;
  emoji: string;
  tags: string;
  kind: string;
  etaMinutes: number;
  stock: number;
  active: boolean;
  sellerId: string;
  commissionPercent: unknown;
  category?: { slug: string; name?: string } | null;
  seller?: { shopName: string; lat: number | null; lng: number | null; address: string } | null;
}): CatalogItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    unit: p.unit,
    price: p.price,
    mrp: p.mrp ?? undefined,
    category: p.category?.slug ?? "",
    categoryName: p.category?.name,
    kind: (p.kind as ItemKind) || "product",
    etaMinutes: p.etaMinutes,
    image: p.image,
    emoji: p.emoji,
    blurb: p.blurb,
    tags: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    sellerId: p.sellerId,
    sellerName: p.seller?.shopName,
    sellerLat: p.seller?.lat ?? null,
    sellerLng: p.seller?.lng ?? null,
    sellerAddress: p.seller?.address,
    stock: p.stock,
    active: p.active,
    commissionPercent: p.commissionPercent == null ? null : Number(p.commissionPercent),
  };
}

const productInclude = {
  category: true,
  seller: { select: { shopName: true, lat: true, lng: true, address: true } },
} as const;

export async function listActiveProducts(): Promise<CatalogItem[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include: productInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getItem(slug: string) {
  const row = await prisma.product.findFirst({
    where: { slug, active: true },
    include: productInclude,
  });
  return row ? mapProduct(row) : null;
}

export async function getItemById(id: string) {
  const row = await prisma.product.findFirst({
    where: { id, active: true },
    include: productInclude,
  });
  return row ? mapProduct(row) : null;
}

export async function itemsByCategory(slug: string) {
  const rows = await prisma.product.findMany({
    where: { active: true, category: { slug } },
    include: productInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapProduct);
}

/** Same aisle first, then other live SKUs — the live catalog is small. */
export async function relatedFor(item: CatalogItem, limit = 4): Promise<CatalogItem[]> {
  const sameAisle = item.category
    ? (await itemsByCategory(item.category)).filter((row) => row.id !== item.id)
    : [];
  if (sameAisle.length >= limit) return sameAisle.slice(0, limit);
  const rest = await listActiveProducts();
  const seen = new Set([item.id, ...sameAisle.map((row) => row.id)]);
  return [...sameAisle, ...rest.filter((row) => !seen.has(row.id))].slice(0, limit);
}

export async function searchItems(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listActiveProducts();
  if (q === "off" || q === "deal") {
    const rows = await prisma.product.findMany({
      where: { active: true, mrp: { not: null } },
      include: productInclude,
    });
    return rows.filter((p) => p.mrp && p.mrp > p.price).map(mapProduct);
  }
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q } },
        { blurb: { contains: q } },
        { tags: { contains: q } },
        { category: { name: { contains: q } } },
      ],
    },
    include: productInclude,
  });
  return rows.map(mapProduct);
}

export async function featuredItems() {
  const rows = await prisma.product.findMany({
    where: { active: true, kind: "product" },
    include: productInclude,
    take: 10,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct);
}

export async function dealItems() {
  const all = await prisma.product.findMany({
    where: { active: true, mrp: { not: null } },
    include: productInclude,
  });
  return all.filter((p) => p.mrp && p.mrp > p.price).slice(0, 8).map(mapProduct);
}

export async function serviceItems() {
  const rows = await prisma.product.findMany({
    where: { active: true, kind: "service" },
    include: productInclude,
  });
  return rows.map(mapProduct);
}

export async function listCategories(kind?: "product" | "service"): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: {
      ...(kind ? { kind } : {}),
      products: { some: { active: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((c) => withTint(c));
}

export async function getCategory(slug: string): Promise<Category | null> {
  const c = await prisma.category.findUnique({ where: { slug } });
  if (!c) return null;
  return withTint(c);
}
