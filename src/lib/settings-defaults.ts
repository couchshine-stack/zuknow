export type AppSettings = {
  appName: string;
  supportPhone: string;
  cityName: string;
  freeDeliveryOver: number;
  deliveryFee: number;
  maxDeliveryKm: number;
  packMinutes: number;
  scooterKmh: number;
  cityLat: number;
  cityLng: number;
  cityRadiusKm: number;
  otpExpiryMinutes: number;
  otpMaxAttempts: number;
  otpPerHour: number;
  customerSessionDays: number;
  adminSessionDays: number;
  secureCookies: boolean;
  allowedOrigins: string;
  maintenanceMode: boolean;
  allowOtpPreview: boolean;
  guestCheckout: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  whatsappBaseUrl: string;
  whatsappClientId: string;
  whatsappApiKey: string;
  whatsappAdminNotifyPhone: string;
  whatsappNotifyOnOrder: boolean;
  whatsappNotifyCustomerOnOrder: boolean;
  googleMapsBrowserKey: string;
  googleMapsServerKey: string;
};

export const SECRET_SETTING_KEYS = ["razorpayKeySecret", "whatsappApiKey", "whatsappClientId", "googleMapsServerKey"] as const;

export const NUMBER_SETTING_KEYS = [
  "freeDeliveryOver",
  "deliveryFee",
  "maxDeliveryKm",
  "packMinutes",
  "scooterKmh",
  "cityLat",
  "cityLng",
  "cityRadiusKm",
  "otpExpiryMinutes",
  "otpMaxAttempts",
  "otpPerHour",
  "customerSessionDays",
  "adminSessionDays",
] as const;

export const BOOL_SETTING_KEYS = [
  "secureCookies",
  "maintenanceMode",
  "allowOtpPreview",
  "guestCheckout",
  "whatsappNotifyOnOrder",
  "whatsappNotifyCustomerOnOrder",
] as const;

export type PublicConfig = {
  appName: string;
  supportPhone: string;
  cityName: string;
  razorpayKeyId: string;
  googleMapsBrowserKey: string;
  maxDeliveryKm: number;
  packMinutes: number;
  scooterKmh: number;
  cityLat: number;
  cityLng: number;
  cityRadiusKm: number;
  freeDeliveryOver: number;
  deliveryFee: number;
  maintenanceMode: boolean;
  guestCheckout: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  appName: "zuknow.in",
  supportPhone: "",
  cityName: "Amravati",
  freeDeliveryOver: 99,
  deliveryFee: 19,
  maxDeliveryKm: 12,
  packMinutes: 4,
  scooterKmh: 22,
  cityLat: 20.9374,
  cityLng: 77.7796,
  cityRadiusKm: 12,
  otpExpiryMinutes: 5,
  otpMaxAttempts: 5,
  otpPerHour: 8,
  customerSessionDays: 30,
  adminSessionDays: 7,
  secureCookies: false,
  allowedOrigins: "",
  maintenanceMode: false,
  allowOtpPreview: false,
  guestCheckout: true,
  razorpayKeyId: "",
  razorpayKeySecret: "",
  whatsappBaseUrl: "http://otp.turnkeyinfotech.live",
  whatsappClientId: "",
  whatsappApiKey: "",
  whatsappAdminNotifyPhone: "",
  whatsappNotifyOnOrder: true,
  whatsappNotifyCustomerOnOrder: false,
  googleMapsBrowserKey: "",
  googleMapsServerKey: "",
};

export function toPublicConfig(settings: AppSettings): PublicConfig {
  return {
    appName: settings.appName,
    supportPhone: settings.supportPhone,
    cityName: settings.cityName,
    razorpayKeyId: settings.razorpayKeyId,
    googleMapsBrowserKey: settings.googleMapsBrowserKey,
    maxDeliveryKm: settings.maxDeliveryKm,
    packMinutes: settings.packMinutes,
    scooterKmh: settings.scooterKmh,
    cityLat: settings.cityLat,
    cityLng: settings.cityLng,
    cityRadiusKm: settings.cityRadiusKm,
    freeDeliveryOver: settings.freeDeliveryOver,
    deliveryFee: settings.deliveryFee,
    maintenanceMode: settings.maintenanceMode,
    guestCheckout: settings.guestCheckout !== false,
  };
}

export function geoFromConfig(config: Pick<AppSettings, "packMinutes" | "scooterKmh" | "maxDeliveryKm" | "cityLat" | "cityLng" | "cityRadiusKm">) {
  return {
    packMinutes: config.packMinutes,
    scooterKmh: config.scooterKmh,
    maxDeliveryKm: config.maxDeliveryKm,
    cityLat: config.cityLat,
    cityLng: config.cityLng,
    cityRadiusKm: config.cityRadiusKm,
  };
}
