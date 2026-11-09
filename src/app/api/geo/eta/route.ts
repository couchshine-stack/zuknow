import { NextResponse } from "next/server";
import { z } from "zod";
import { distanceMatrix } from "@/lib/google-maps";

const bodySchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  destinations: z.array(
    z.object({
      id: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
  ).max(20),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Need origin and destinations." }, { status: 400 });
  }
  const results = await distanceMatrix(parsed.data.origin, parsed.data.destinations);
  return NextResponse.json({ results });
}
