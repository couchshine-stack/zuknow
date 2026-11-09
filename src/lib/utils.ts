import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(rupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidIndianMobile(input: string) {
  return /^[6-9]\d{9}$/.test(normalizePhone(input));
}

export function toWhatsAppPhone(input: string) {
  return `91${normalizePhone(input)}`;
}

export function deliveryFeeFor(subtotal: number, freeOver = 99, fee = 19) {
  if (subtotal >= freeOver) return 0;
  return fee;
}
