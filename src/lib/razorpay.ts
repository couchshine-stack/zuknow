import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { getSettings } from "./settings";

export async function getRazorpay() {
  const settings = await getSettings();
  const key_id = settings.razorpayKeyId;
  const key_secret = settings.razorpayKeySecret;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured. Add them in Admin → Settings.");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const settings = await getSettings();
  const secret = settings.razorpayKeySecret;
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
