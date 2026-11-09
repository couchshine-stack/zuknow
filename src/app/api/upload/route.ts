import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSellerUser } from "@/lib/seller-auth";
import { saveUploadedImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const [admin, seller] = await Promise.all([getAdminUser(), getSellerUser()]);
  if (!admin && !seller) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a photo." }, { status: 400 });
  }
  const saved = await saveUploadedImage(file);
  if (saved.error) {
    return NextResponse.json({ error: saved.error }, { status: 400 });
  }
  return NextResponse.json({ url: saved.url });
}
