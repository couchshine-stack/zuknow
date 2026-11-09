import { NextResponse } from "next/server";
import { getPublicConfig, getSettings, isOriginAllowed } from "@/lib/settings";

export async function GET(request: Request) {
  const config = await getPublicConfig();
  const res = NextResponse.json(config);
  const origin = request.headers.get("origin") || "";
  if (origin) {
    const settings = await getSettings();
    if (isOriginAllowed(origin, settings)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Vary", "Origin");
    }
  }
  res.headers.set("Cache-Control", "public, max-age=15");
  return res;
}
