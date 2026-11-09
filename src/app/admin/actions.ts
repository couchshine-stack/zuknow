"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, createAdminToken, getAdminUser, verifyAdminPassword } from "@/lib/admin-auth";
import { getSellerUser } from "@/lib/seller-auth";
import { NEXT_STATUS } from "@/lib/orders";
import { parseOptionalPercent, slugify } from "@/lib/slug";
import { cookieSecure, getSettings, saveSettings } from "@/lib/settings";
import type { AppSettings } from "@/lib/settings-defaults";

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const admin = await verifyAdminPassword(email, password);
  if (!admin) return { error: "Email or password did not match." };
  const token = await createAdminToken(admin.id, admin.email);
  const settings = await getSettings();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(settings),
    path: "/",
    maxAge: settings.adminSessionDays * 60 * 60 * 24,
  });
  redirect("/admin");
}

export async function adminLogoutAction() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  redirect("/admin/login");
}

export async function saveSellerCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const commissionPercent = Number(formData.get("commissionPercent") || 15);
  const description = String(formData.get("description") || "").trim();
  if (!name) throw new Error("Name is required.");
  const slug = slugify(String(formData.get("slug") || name));
  if (id) {
    await prisma.sellerCategory.update({
      where: { id },
      data: { name, slug, description, commissionPercent },
    });
  } else {
    await prisma.sellerCategory.create({
      data: { name, slug, description, commissionPercent },
    });
  }
  revalidatePath("/admin/seller-categories");
  revalidatePath("/admin/commission");
  redirect("/admin/seller-categories");
}

export async function deleteSellerCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const used = await prisma.seller.count({ where: { sellerCategoryId: id } });
  if (used) throw new Error("Move sellers out of this category first.");
  await prisma.sellerCategory.delete({ where: { id } });
  revalidatePath("/admin/seller-categories");
}

export async function saveSellerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const shopName = String(formData.get("shopName") || "").trim();
  const ownerName = String(formData.get("ownerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const sellerCategoryId = String(formData.get("sellerCategoryId") || "");
  if (!shopName || !ownerName || !phone || !sellerCategoryId) {
    return { error: "Shop, owner, phone and category are required." };
  }
  const data: {
    shopName: string;
    ownerName: string;
    phone: string;
    email: string;
    city: string;
    pincode: string;
    address: string;
    gstNumber: string;
    pan: string;
    status: string;
    sellerCategoryId: string;
    commissionPercent: number | null;
    lat: number | null;
    lng: number | null;
    passwordHash?: string;
  } = {
    shopName,
    ownerName,
    phone,
    email: String(formData.get("email") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    pincode: String(formData.get("pincode") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    gstNumber: String(formData.get("gstNumber") || "").trim(),
    pan: String(formData.get("pan") || "").trim(),
    status: String(formData.get("status") || "active"),
    sellerCategoryId,
    commissionPercent: parseOptionalPercent(formData.get("commissionPercent")),
    lat: Number.isFinite(Number(formData.get("lat"))) ? Number(formData.get("lat")) : null,
    lng: Number.isFinite(Number(formData.get("lng"))) ? Number(formData.get("lng")) : null,
  };
  const password = String(formData.get("password") || "");
  if (password) {
    if (password.length < 6) return { error: "Seller password must be at least 6 characters." };
    data.passwordHash = await bcrypt.hash(password, 12);
  } else if (!id) {
    return { error: "Set a portal password so this shop can log in at /seller." };
  }
  const geoAddress = String(formData.get("geocodedAddress") || "").trim();
  if (!data.address && geoAddress) data.address = geoAddress;
  if (id) await prisma.seller.update({ where: { id }, data });
  else await prisma.seller.create({ data });
  revalidatePath("/admin/sellers");
  redirect("/admin/sellers");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const sellerId = String(formData.get("sellerId") || "");
  const price = Number(formData.get("price") || 0);
  if (!name || !categoryId || !sellerId || price <= 0) {
    return { error: "Name, aisle, seller and price are required." };
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
    commissionPercent: parseOptionalPercent(formData.get("commissionPercent")),
    categoryId,
    sellerId,
  };
  if (id) await prisma.product.update({ where: { id }, data });
  else await prisma.product.create({ data });
  try {
    revalidatePath("/admin/products");
  } catch {
    /* ignore */
  }
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.product.update({ where: { id }, data: { active: false } });
  try {
    revalidatePath("/admin/products");
  } catch {
    /* ignore */
  }
}

export async function saveCommissionOverrideAction(formData: FormData) {
  await requireAdmin();
  const kind = String(formData.get("kind") || "");
  const id = String(formData.get("id") || "");
  const percent = parseOptionalPercent(formData.get("commissionPercent"));
  if (kind === "seller") {
    await prisma.seller.update({ where: { id }, data: { commissionPercent: percent } });
  } else if (kind === "product") {
    await prisma.product.update({ where: { id }, data: { commissionPercent: percent } });
  } else if (kind === "category") {
    const n = Number(formData.get("commissionPercent") || 0);
    await prisma.sellerCategory.update({ where: { id }, data: { commissionPercent: n } });
  }
  revalidatePath("/admin/commission");
}

function num(formData: FormData, key: string, fallback: number) {
  const n = Number(formData.get(key));
  return Number.isFinite(n) ? n : fallback;
}

export async function saveAppSettingsAction(formData: FormData) {
  await requireAdmin();
  const current = await getSettings();
  const pickSecret = (key: keyof AppSettings) => {
    const raw = String(formData.get(key) || "").trim();
    return raw || current[key];
  };
  try {
  await saveSettings({
    appName: String(formData.get("appName") || "zuknow.in").trim(),
    supportPhone: String(formData.get("supportPhone") || "").trim(),
    cityName: String(formData.get("cityName") || "Amravati").trim(),
    freeDeliveryOver: num(formData, "freeDeliveryOver", 99),
    deliveryFee: num(formData, "deliveryFee", 19),
    maxDeliveryKm: num(formData, "maxDeliveryKm", 12),
    packMinutes: num(formData, "packMinutes", 4),
    scooterKmh: num(formData, "scooterKmh", 22),
    cityLat: num(formData, "cityLat", 20.9374),
    cityLng: num(formData, "cityLng", 77.7796),
    cityRadiusKm: num(formData, "cityRadiusKm", 12),
    otpExpiryMinutes: Math.max(1, num(formData, "otpExpiryMinutes", 5)),
    otpMaxAttempts: Math.max(1, num(formData, "otpMaxAttempts", 5)),
    otpPerHour: Math.max(1, num(formData, "otpPerHour", 8)),
    customerSessionDays: Math.max(1, num(formData, "customerSessionDays", 30)),
    adminSessionDays: Math.max(1, num(formData, "adminSessionDays", 7)),
    secureCookies: String(formData.get("secureCookies") || "") === "on",
    allowedOrigins: String(formData.get("allowedOrigins") || "").trim(),
    maintenanceMode: String(formData.get("maintenanceMode") || "") === "on",
    allowOtpPreview: String(formData.get("allowOtpPreview") || "") === "on",
    guestCheckout: String(formData.get("guestCheckout") || "") === "on",
    razorpayKeyId: String(formData.get("razorpayKeyId") || "").trim(),
    razorpayKeySecret: String(pickSecret("razorpayKeySecret")),
    whatsappBaseUrl: String(formData.get("whatsappBaseUrl") || "").trim(),
    whatsappClientId: String(pickSecret("whatsappClientId")),
    whatsappApiKey: String(pickSecret("whatsappApiKey")),
    whatsappAdminNotifyPhone: String(formData.get("whatsappAdminNotifyPhone") || "").trim(),
    whatsappNotifyOnOrder: String(formData.get("whatsappNotifyOnOrder") || "") === "on",
    whatsappNotifyCustomerOnOrder: String(formData.get("whatsappNotifyCustomerOnOrder") || "") === "on",
    googleMapsBrowserKey: String(formData.get("googleMapsBrowserKey") || "").trim(),
    googleMapsServerKey: String(pickSecret("googleMapsServerKey")),
  });
  } catch {
    redirect("/admin/settings?error=1");
  }
  try {
    revalidatePath("/admin/settings");
  } catch {
    /* ignore */
  }
  redirect("/admin/settings?saved=1");
}

export async function updateAdminAccountAction(formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const ok = await verifyAdminPassword(admin.email, currentPassword);
  if (!ok) return { error: "Current password did not match." };
  if (!email.includes("@")) return { error: "Enter a valid admin email." };
  const data: { email: string; passwordHash?: string } = { email };
  if (newPassword) {
    if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }
  await prisma.adminUser.update({ where: { id: admin.id }, data });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?account=1");
}

export async function advanceOrderAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const admin = await getAdminUser();
  const seller = await getSellerUser();
  if (!admin && !seller) redirect("/admin/login");

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw new Error("Order not found.");
  if (!admin && seller && !order.items.some((item) => item.sellerId === seller.id)) {
    throw new Error("This order is not for your shop.");
  }
  const allowed = NEXT_STATUS[order.status] || [];
  if (!allowed.includes(status)) throw new Error("That step is not allowed from the current status.");

  await prisma.order.update({ where: { id }, data: { status } });

  // Asynchronously notify customer of milestone updates (e.g. out for delivery or delivered)
  if (status === "out" || status === "delivered") {
    import("@/lib/whatsapp")
      .then(({ notifyCustomerOnOrderStatusUpdate }) => notifyCustomerOnOrderStatusUpdate(id, status))
      .catch((err) => console.error("Error sending order status WhatsApp:", err));
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/seller/orders");
  revalidatePath("/seller");
}

export async function testWhatsAppAction(formData: FormData) {
  await requireAdmin();
  const phone = String(formData.get("phone") || "").trim();
  if (!phone) return { error: "Please enter a 10-digit phone number." };
  const { sendTestWhatsAppMessage } = await import("@/lib/whatsapp");
  const res = await sendTestWhatsAppMessage(phone);
  if (!res.ok) {
    return { error: res.error || "Failed to send test message via Turnkey Gateway." };
  }
  return { success: true };
}
