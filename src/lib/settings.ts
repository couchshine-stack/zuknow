import { prisma } from "./db";
import { decryptSecret, encryptSecret } from "./secret-box";
import {
  BOOL_SETTING_KEYS,
  DEFAULT_SETTINGS,
  NUMBER_SETTING_KEYS,
  SECRET_SETTING_KEYS,
  toPublicConfig,
  type AppSettings,
} from "./settings-defaults";

export type { AppSettings, PublicConfig } from "./settings-defaults";
export { DEFAULT_SETTINGS, toPublicConfig, geoFromConfig } from "./settings-defaults";

const SECRET_SET = new Set<string>(SECRET_SETTING_KEYS);
const NUMBER_SET = new Set<string>(NUMBER_SETTING_KEYS);
const BOOL_SET = new Set<string>(BOOL_SETTING_KEYS);

function envDefaults(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    secureCookies: process.env.NODE_ENV === "production",
    allowOtpPreview: process.env.NODE_ENV !== "production",
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
    whatsappBaseUrl: (process.env.WHATSAPP_OTP_BASE_URL || DEFAULT_SETTINGS.whatsappBaseUrl).replace(/^["']|["']$/g, ""),
    whatsappClientId: (process.env.WHATSAPP_CLIENT_ID || "").replace(/^["']|["']$/g, "").trim(),
    whatsappApiKey: (process.env.WHATSAPP_API_KEY || "").replace(/^["']|["']$/g, "").trim(),
    whatsappAdminNotifyPhone: (process.env.WHATSAPP_ADMIN_NOTIFY_PHONE || "").replace(/^["']|["']$/g, "").trim(),
    whatsappNotifyOnOrder: process.env.WHATSAPP_NOTIFY_ON_ORDER !== "false",
    whatsappNotifyCustomerOnOrder: process.env.WHATSAPP_NOTIFY_CUSTOMER_ON_ORDER === "true",
    googleMapsBrowserKey: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").replace(/^["']|["']$/g, ""),
    googleMapsServerKey: (process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").replace(
      /^["']|["']$/g,
      "",
    ),
  };
}

function parseValue(key: keyof AppSettings, raw: string): string | number | boolean {
  if (NUMBER_SET.has(key)) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : DEFAULT_SETTINGS[key];
  }
  if (BOOL_SET.has(key)) return raw === "true" || raw === "1";
  return raw;
}

function hydrate(rows: Array<{ key: string; value: string; secret: boolean }>): AppSettings {
  const settings = { ...envDefaults() };
  const env = envDefaults();
  for (const row of rows) {
    if (!(row.key in settings)) continue;
    const key = row.key as keyof AppSettings;
    let raw = "";
    try {
      raw = row.secret ? decryptSecret(row.value) : row.value;
    } catch {
      continue;
    }
    if (SECRET_SET.has(key) && !String(raw || "").trim()) continue;
    if ((key === "whatsappClientId" || key === "whatsappApiKey" || key === "whatsappBaseUrl") && !String(raw || "").trim()) {
      continue;
    }
    (settings as Record<string, string | number | boolean>)[key] = parseValue(key, raw);
  }
  for (const key of SECRET_SETTING_KEYS) {
    if (!String(settings[key] || "").trim() && env[key]) {
      (settings as Record<string, string | number | boolean>)[key] = env[key];
    }
  }
  if (!settings.whatsappClientId) settings.whatsappClientId = env.whatsappClientId;
  if (!settings.whatsappApiKey) settings.whatsappApiKey = env.whatsappApiKey;
  return settings;
}

async function seedFromEnvIfEmpty() {
  const count = await prisma.appSetting.count();
  if (count > 0) return;
  const defaults = envDefaults();
  await Promise.all(
    (Object.keys(defaults) as Array<keyof AppSettings>).map((key) =>
      prisma.appSetting.upsert({
        where: { key },
        create: {
          key,
          value: SECRET_SET.has(key) ? encryptSecret(String(defaults[key] ?? "")) : String(defaults[key] ?? ""),
          secret: SECRET_SET.has(key),
        },
        update: {},
      }),
    ),
  );
}

async function loadSettings(): Promise<AppSettings> {
  try {
    await seedFromEnvIfEmpty();
    const rows = await prisma.appSetting.findMany();
    return hydrate(rows);
  } catch {
    return envDefaults();
  }
}

let memory: { at: number; value: AppSettings } | null = null;
const MEMORY_MS = 8_000;

function clearSettingsCache() {
  memory = null;
}

export async function getSettings() {
  if (memory && Date.now() - memory.at < MEMORY_MS) return memory.value;
  const value = await loadSettings();
  memory = { at: Date.now(), value };
  return value;
}

export async function getPublicConfig() {
  return toPublicConfig(await getSettings());
}

export type SettingsSecrets = Record<(typeof SECRET_SETTING_KEYS)[number], boolean>;

export async function getSettingsForAdmin() {
  const settings = await getSettings();
  const secrets = Object.fromEntries(SECRET_SETTING_KEYS.map((key) => [key, Boolean(settings[key])])) as SettingsSecrets;
  const safe = { ...settings };
  for (const key of SECRET_SETTING_KEYS) safe[key] = "";
  return { settings: safe, secrets };
}

export async function saveSettings(patch: Partial<AppSettings>) {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof AppSettings>) {
    const value = next[key];
    await prisma.appSetting.upsert({
      where: { key },
      create: {
        key,
        value: SECRET_SET.has(key) ? encryptSecret(String(value ?? "")) : String(value ?? ""),
        secret: SECRET_SET.has(key),
      },
      update: {
        value: SECRET_SET.has(key) ? encryptSecret(String(value ?? "")) : String(value ?? ""),
        secret: SECRET_SET.has(key),
      },
    });
  }
  clearSettingsCache();
}

export function cookieSecure(settings: AppSettings) {
  return settings.secureCookies || process.env.NODE_ENV === "production";
}

export function isOriginAllowed(origin: string, settings: AppSettings) {
  if (!origin) return true;
  const extras = settings.allowedOrigins
    .split(",")
    .map((row) => row.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const app = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const allowed = new Set([
    app,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    ...extras,
  ]);
  return allowed.has(origin.replace(/\/$/, ""));
}
