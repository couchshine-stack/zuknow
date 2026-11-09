"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { cookieSecure, getSettings } from "@/lib/settings";
import { createSellerToken, getSellerUser, SELLER_COOKIE, verifySellerLogin } from "@/lib/seller-auth";
import { slugify } from "@/lib/slug";

async function requireSeller() {
  const seller = await getSellerUser();
  if (!seller) redirect("/seller/login");
  return seller;
}

export async function sellerLoginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") || "");
  const password = String(formData.get("password") || "");
  const result = await verifySellerLogin(identifier, password);
  if (!result.ok) return { error: result.error };
  const token = await createSellerToken(result.seller.id, result.seller.phone);
  const settings = await getSettings();
  const jar = await cookies();
  jar.set(SELLER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(settings),
    path: "/",
    maxAge: settings.adminSessionDays * 60 * 60 * 24,
  });
  redirect("/seller");
}

export async function sellerLogoutAction() {
  const jar = await cookies();
  jar.set(SELLER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  redirect("/seller/login");
}

export async function saveSellerProductAction(formData: FormData) {
  const seller = await requireSeller();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const price = Number(formData.get("price") || 0);
  if (!name || !categoryId || price <= 0) {
    return { error: "Name, aisle and price are required." };
  }
  if (id) {
    const existing = await prisma.product.findFirst({ where: { id, sellerId: seller.id } });
    if (!existing) return { error: "That product is not in your shop." };
  }
  const slug = slugify(String(formData.get("slug") || name));
  const mrpRaw = String(formData.get("mrp") || "").trim();
  const data = {
    name,
    slug,
    unit: String(formData.get("unit") || "1 pc").trim(),
    price,
    mrp: mrpRaw ? Number(mrpRaw) : null,
    blurb: String(formData.get("blurb") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    emoji: String(formData.get("emoji") || "").trim(),
    tags: String(formData.get("tags") || "").trim(),
    kind: String(formData.get("kind") || "product"),
    etaMinutes: Number(formData.get("etaMinutes") || 15),
    stock: Number(formData.get("stock") || 0),
    active: String(formData.get("active") || "") === "on",
    categoryId,
    sellerId: seller.id,
  };
  if (id) await prisma.product.update({ where: { id }, data });
  else await prisma.product.create({ data });
  try {
    revalidatePath("/seller/products");
  } catch {
    /* ignore */
  }
  redirect("/seller/products");
}

export async function hideSellerProductAction(formData: FormData) {
  const seller = await requireSeller();
  const id = String(formData.get("id") || "");
  await prisma.product.updateMany({ where: { id, sellerId: seller.id }, data: { active: false } });
  try {
    revalidatePath("/seller/products");
  } catch {
    /* ignore */
  }
}

export async function changeSellerPasswordAction(formData: FormData) {
  const seller = await requireSeller();
  const password = String(formData.get("password") || "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  await prisma.seller.update({
    where: { id: seller.id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });
  return { ok: true };
}
