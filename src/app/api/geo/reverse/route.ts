import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/google-maps";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }
  const label = await reverseGeocode({ lat, lng });
  return NextResponse.json({ label, lat, lng });
}
