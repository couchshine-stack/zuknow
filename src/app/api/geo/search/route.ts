import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/google-maps";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const results = await searchPlaces(q);
  return NextResponse.json({ results });
}
