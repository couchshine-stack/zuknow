import { NextResponse } from "next/server";
import { listActiveProducts, searchItems } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  let items = q ? await searchItems(q) : await listActiveProducts();
  if (category) items = items.filter((item) => item.category === category);
  return NextResponse.json({ items });
}
