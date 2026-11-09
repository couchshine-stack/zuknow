import { applyDatabaseUrl } from "../src/lib/database-url";
import { PrismaClient } from "@prisma/client";

applyDatabaseUrl();
import bcrypt from "bcryptjs";
import { CATALOG, CATEGORIES, SERVICES } from "../src/data/catalog";

const prisma = new PrismaClient();

const sellerCategories = [
  { id: "sc-grocery", name: "Grocery dark store", slug: "grocery-dark-store", description: "Food, dairy, snacks, cooking staples", commissionPercent: 18 },
  { id: "sc-build", name: "Home build & hardware", slug: "home-build", description: "Cement, electrical, plumbing, tools", commissionPercent: 12 },
  { id: "sc-electronics", name: "Electronics", slug: "electronics", description: "Phones, chargers, gadgets", commissionPercent: 10 },
  { id: "sc-wellness", name: "Pharmacy & care", slug: "wellness", description: "Pharmacy, baby, pets, personal care", commissionPercent: 8 },
  { id: "sc-home", name: "Home essentials", slug: "home-essentials", description: "Cleaning and household", commissionPercent: 15 },
  { id: "sc-services", name: "On-demand services", slug: "on-demand-services", description: "Cooks, electricians, plumbers, cleaners", commissionPercent: 20 },
];

const sellers = [
  {
    id: "seller-dark-store",
    shopName: "Zuknow Dark Store · Rajapeth",
    ownerName: "Asha Mehra",
    phone: "9811111111",
    email: "rajapeth@zuknow.in",
    city: "Amravati",
    pincode: "444602",
    address: "Rajapeth Main Road, Amravati",
    lat: 20.9254,
    lng: 77.7586,
    sellerCategoryId: "sc-grocery",
  },
  {
    id: "seller-hardware",
    shopName: "Zuknow Hardware Hub · Camp",
    ownerName: "Ravi Patel",
    phone: "9822222222",
    email: "hardware@zuknow.in",
    city: "Amravati",
    pincode: "444603",
    address: "Camp, Amravati",
    lat: 20.9378,
    lng: 77.7612,
    sellerCategoryId: "sc-build",
  },
  {
    id: "seller-gitti",
    shopName: "Zuknow Gitte Wale · Camp",
    ownerName: "Sanjay Deshmukh",
    phone: "9877777777",
    email: "gitti@zuknow.in",
    city: "Amravati",
    pincode: "444603",
    address: "Camp quarry road, Amravati",
    lat: 20.9412,
    lng: 77.7584,
    sellerCategoryId: "sc-build",
  },
  {
    id: "seller-gadgets",
    shopName: "Zuknow Gadget Lane · Jaistambh",
    ownerName: "Neha Shah",
    phone: "9833333333",
    email: "gadgets@zuknow.in",
    city: "Amravati",
    pincode: "444601",
    address: "Jaistambh Chowk, Amravati",
    lat: 20.9326,
    lng: 77.7525,
    sellerCategoryId: "sc-electronics",
  },
  {
    id: "seller-care",
    shopName: "Zuknow Care · Ravi Nagar",
    ownerName: "Dr. Kabir Rao",
    phone: "9844444444",
    email: "care@zuknow.in",
    city: "Amravati",
    pincode: "444605",
    address: "Ravi Nagar, Amravati",
    lat: 20.9482,
    lng: 77.7731,
    sellerCategoryId: "sc-wellness",
  },
  {
    id: "seller-home",
    shopName: "Zuknow Home Rack · Sai Nagar",
    ownerName: "Meera Iyer",
    phone: "9855555555",
    email: "home@zuknow.in",
    city: "Amravati",
    pincode: "444607",
    address: "Sai Nagar, Amravati",
    lat: 20.9585,
    lng: 77.7874,
    sellerCategoryId: "sc-home",
  },
  {
    id: "seller-pros",
    shopName: "Zuknow Home Pros · Irwin Square",
    ownerName: "Imran Khan",
    phone: "9866666666",
    email: "pros@zuknow.in",
    city: "Amravati",
    pincode: "444601",
    address: "Irwin Square, Amravati",
    lat: 20.9301,
    lng: 77.7558,
    sellerCategoryId: "sc-services",
  },
  {
    id: "seller-upholstery",
    shopName: "Zuknow Sofa & Upholstery Care",
    ownerName: "Upholstery Pro Team",
    phone: "8097041187",
    email: "upholstery@zuknow.in",
    city: "Amravati",
    pincode: "444601",
    address: "Doorstep Service / Irwin Square, Amravati",
    lat: 20.9320,
    lng: 77.7560,
    sellerCategoryId: "sc-services",
  },
];

const LIVE_PRODUCT_SLUGS = [
  "farm-bananas",
  "toned-milk-1l",
  "hammer-claw",
  "power-bank",
  "electrician-visit",
  "cement-ppc",
  "gitti-20mm-cft",
  "gitti-20mm-truck-100",
  "gitti-20mm-truck-200",
  "gitti-40mm-truck-100",
  "sand-river-cft",
  "sand-river-truck-100",
  "murum-truck-100",
  "bricks-red-1000",
  "sofa-deep-cleaning",
  "carpet-deep-cleaning",
  "mattress-deep-cleaning",
  "chair-deep-cleaning",
  "nano-coating-protection",
];

function sellerIdFor(item: { slug: string; category: string; kind: string; tags: string[] }) {
  if (item.category === "sofa-cleaning") return "seller-upholstery";
  if (item.kind === "service") return "seller-pros";
  if (item.tags.includes("gitti-wale")) return "seller-gitti";
  if (["groceries", "fruits-veg", "dairy", "cooking", "snacks", "kitchen"].includes(item.category)) return "seller-dark-store";
  if (["build", "electrical", "plumbing"].includes(item.category)) return "seller-hardware";
  if (item.category === "electronics") return "seller-gadgets";
  if (["pharmacy", "personal-care", "baby", "pets"].includes(item.category)) return "seller-care";
  return "seller-home";
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@zuknow.in").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "zuknow-admin-15";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Zuknow Admin" },
    create: { email, name: "Zuknow Admin", passwordHash },
  });

  for (const row of sellerCategories) {
    await prisma.sellerCategory.upsert({
      where: { slug: row.slug },
      update: {
        name: row.name,
        description: row.description,
        commissionPercent: row.commissionPercent,
      },
      create: row,
    });
  }

  const sellerPasswordHash = await bcrypt.hash(process.env.SELLER_PASSWORD || "seller-15", 10);

  for (const row of sellers) {
    await prisma.seller.upsert({
      where: { id: row.id },
      update: {
        shopName: row.shopName,
        ownerName: row.ownerName,
        phone: row.phone,
        email: row.email,
        city: row.city,
        pincode: row.pincode,
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        sellerCategoryId: row.sellerCategoryId,
        status: "active",
        passwordHash: sellerPasswordHash,
      },
      create: { ...row, status: "active", passwordHash: sellerPasswordHash },
    });
  }

  const aisle = [...CATEGORIES.map((c, i) => ({ ...c, kind: "product" as const, sortOrder: i })), ...SERVICES.map((c, i) => ({ ...c, kind: "service" as const, sortOrder: 100 + i }))];

  for (const cat of aisle) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        tagline: cat.tagline,
        emoji: cat.emoji,
        tint: cat.tint,
        kind: cat.kind,
        sortOrder: cat.sortOrder,
      },
      create: {
        id: cat.slug,
        slug: cat.slug,
        name: cat.name,
        tagline: cat.tagline,
        emoji: cat.emoji,
        tint: cat.tint,
        kind: cat.kind,
        sortOrder: cat.sortOrder,
      },
    });
  }

  for (const item of CATALOG) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        unit: item.unit,
        price: item.price,
        mrp: item.mrp ?? null,
        blurb: item.blurb,
        image: item.image,
        emoji: item.emoji,
        tags: item.tags.join(","),
        kind: item.kind,
        etaMinutes: item.etaMinutes,
        categoryId: item.category,
        sellerId: sellerIdFor(item),
        active: LIVE_PRODUCT_SLUGS.includes(item.slug),
      },
      create: {
        id: item.id,
        slug: item.slug,
        name: item.name,
        unit: item.unit,
        price: item.price,
        mrp: item.mrp ?? null,
        blurb: item.blurb,
        image: item.image,
        emoji: item.emoji,
        tags: item.tags.join(","),
        kind: item.kind,
        etaMinutes: item.etaMinutes,
        stock: 100,
        active: LIVE_PRODUCT_SLUGS.includes(item.slug),
        categoryId: item.category,
        sellerId: sellerIdFor(item),
      },
    });
  }

  await prisma.product.updateMany({
    where: { slug: { notIn: LIVE_PRODUCT_SLUGS } },
    data: { active: false },
  });

  await prisma.appSetting.upsert({
    where: { key: "cityName" },
    create: { key: "cityName", value: "Amravati", secret: false },
    update: { value: "Amravati" },
  });
  await prisma.appSetting.upsert({
    where: { key: "cityLat" },
    create: { key: "cityLat", value: "20.9374", secret: false },
    update: { value: "20.9374" },
  });
  await prisma.appSetting.upsert({
    where: { key: "cityLng" },
    create: { key: "cityLng", value: "77.7796", secret: false },
    update: { value: "77.7796" },
  });
  await prisma.appSetting.upsert({
    where: { key: "cityRadiusKm" },
    create: { key: "cityRadiusKm", value: "12", secret: false },
    update: { value: "12" },
  });

  const live = await prisma.product.count({ where: { active: true } });
  console.log(
    `Seeded admin ${email}, ${sellers.length} Amravati sellers (portal /seller, password seller-15), ${live} live test products (${LIVE_PRODUCT_SLUGS.join(", ")}).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
