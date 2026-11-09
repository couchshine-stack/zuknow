import { NextResponse } from "next/server";
import { listActiveProducts, listCategories } from "@/lib/catalog";

export async function GET() {
  const [items, categories, services] = await Promise.all([
    listActiveProducts(),
    listCategories("product"),
    listCategories("service"),
  ]);
  return NextResponse.json({ categories, services, items });
}
