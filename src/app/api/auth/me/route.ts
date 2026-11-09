import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, phone: user.phone, name: user.name, email: user.email },
  });
}
