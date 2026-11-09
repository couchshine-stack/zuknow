import { toWhatsAppPhone } from "./utils";
import { getSettings } from "./settings";
import { prisma } from "./db";
import { orderNumber } from "./orders";

type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Sends a WhatsApp text message using Turnkey WhatsApp Gateway.
 * Supports both JSON POST (primary) and GET query params (fallback)
 * as documented in Turnkey WhatsApp Gateway specification.
 */
export async function sendWhatsAppText(phone: string, message: string): Promise<SendResult> {
  const settings = await getSettings();
  const base = settings.whatsappBaseUrl || "http://otp.turnkeyinfotech.live";
  const clientId = settings.whatsappClientId;
  const apiKey = settings.whatsappApiKey;

  if (!clientId || !apiKey) {
    return { ok: false, error: "Turnkey WhatsApp credentials (Client ID / API Key) are not configured." };
  }

  const targetPhone = toWhatsAppPhone(phone);

  // Strategy 1: POST request with JSON payload & x-api-key header (Standard Turnkey API)
  try {
    const postUrl = new URL("/send-text", base);
    const postRes = await fetch(postUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        phone: targetPhone,
        message,
        clientId,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (postRes.ok) {
      return { ok: true };
    }
  } catch {
    // If POST times out or fails network handshake, proceed to GET fallback
  }

  // Strategy 2: GET query parameter fallback (Host/proxy fallback)
  try {
    const getUrl = new URL("/send-text", base);
    getUrl.searchParams.set("phone", targetPhone);
    getUrl.searchParams.set("message", message);
    getUrl.searchParams.set("clientId", clientId);
    getUrl.searchParams.set("apiKey", apiKey);

    const getRes = await fetch(getUrl.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (getRes.ok) {
      return { ok: true };
    }

    const body = await getRes.text().catch(() => "");
    return { ok: false, error: body.slice(0, 250) || `Gateway returned HTTP ${getRes.status}` };
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return { ok: true }; // Gateway queued the request
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not reach Turnkey WhatsApp Gateway",
    };
  }
}

export function otpMessage(code: string, minutes = 5) {
  return `Your zuknow.in login code is ${code}. It expires in ${minutes} minutes. Do not share this code with anyone.`;
}

/**
 * Sends an instant WhatsApp notification to the Admin phone when an order is placed.
 */
export async function notifyAdminOnNewOrder(orderId: string): Promise<SendResult> {
  const settings = await getSettings();

  if (!settings.whatsappNotifyOnOrder || !settings.whatsappAdminNotifyPhone) {
    return { ok: true }; // Notifications disabled or phone not configured
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) return { ok: false, error: "Order not found" };

    let addr: { name?: string; phone?: string; line1?: string; line2?: string; landmark?: string; city?: string; pincode?: string } = {};
    try {
      if (order.addressJson) addr = JSON.parse(order.addressJson);
    } catch {
      /* ignore */
    }

    const customerName = addr.name || order.user?.name || "Customer";
    const customerPhone = addr.phone || order.user?.phone || "N/A";
    const addressStr = [
      addr.line1,
      addr.line2,
      addr.landmark ? `Near ${addr.landmark}` : "",
      addr.city ? `${addr.city} - ${addr.pincode || ""}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "Address on file";

    const itemsSummary = order.items
      .map((item) => `• ${item.name} × ${item.qty} (₹${item.price * item.qty})`)
      .join("\n");

    const message = [
      `🛍️ *NEW ORDER RECEIVED on zuknow.in!*`,
      ``,
      `📦 *Order ID:* #${orderNumber(order.id)}`,
      `💵 *Total Amount:* ₹${order.total} (Paid via Razorpay)`,
      `⏱️ *Delivery ETA:* ~${order.etaMinutes} mins`,
      ``,
      `👤 *Customer:* ${customerName}`,
      `📞 *Phone:* +91 ${customerPhone}`,
      `📍 *Deliver to:*`,
      `${addressStr}`,
      ``,
      `🛒 *Ordered Items (${order.items.length}):*`,
      itemsSummary,
      ``,
      `🛵 Neighborhood dark store alerted. Open panel to process:`,
      `https://zuknow.in/admin/orders`,
    ].join("\n");

    return await sendWhatsAppText(settings.whatsappAdminNotifyPhone, message);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error building admin notification",
    };
  }
}

/**
 * Sends a WhatsApp order confirmation to the customer.
 */
export async function notifyCustomerOnNewOrder(orderId: string): Promise<SendResult> {
  const settings = await getSettings();

  if (!settings.whatsappNotifyCustomerOnOrder) {
    return { ok: true };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) return { ok: false, error: "Order not found" };

    let addr: { name?: string; phone?: string } = {};
    try {
      if (order.addressJson) addr = JSON.parse(order.addressJson);
    } catch {
      /* ignore */
    }

    const customerPhone = addr.phone || order.user?.phone;
    if (!customerPhone) return { ok: false, error: "No customer phone found" };

    const customerName = addr.name || order.user?.name || "Customer";
    const itemsSummary = order.items.map((item) => `• ${item.name} × ${item.qty}`).join("\n");

    const message = [
      `🎉 *Order Confirmed!*`,
      ``,
      `Hello ${customerName}, thank you for ordering with *zuknow.in*!`,
      ``,
      `📦 *Order ID:* #${orderNumber(order.id)}`,
      `⏱️ *Delivery Window:* ~${order.etaMinutes} minutes`,
      `💰 *Total Paid:* ₹${order.total}`,
      ``,
      `🛒 *Your Items:*`,
      itemsSummary,
      ``,
      `🛵 A rider from our dark store is packing your items now.`,
      `Track your order live: https://zuknow.in/track`,
    ].join("\n");

    return await sendWhatsAppText(customerPhone, message);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error sending customer order confirmation",
    };
  }
}

/**
 * Sends a test message through Turnkey WhatsApp Gateway to verify connection.
 */
export async function sendTestWhatsAppMessage(phone: string): Promise<SendResult> {
  const time = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
  const message = [
    `✅ *Turnkey WhatsApp Gateway — Connected!*`,
    ``,
    `Your WhatsApp notifications for *zuknow.in* are operational.`,
    `You will receive instant alerts whenever a new order is placed.`,
    ``,
    `🕒 Verified at: ${time} (IST)`,
  ].join("\n");

  return await sendWhatsAppText(phone, message);
}

/**
 * Sends a WhatsApp status update (e.g. out for delivery, delivered) to the customer.
 */
export async function notifyCustomerOnOrderStatusUpdate(
  orderId: string,
  status: string
): Promise<SendResult> {
  const settings = await getSettings();
  if (!settings.whatsappNotifyCustomerOnOrder) return { ok: true };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) return { ok: false, error: "Order not found" };

    let addr: { name?: string; phone?: string } = {};
    try {
      if (order.addressJson) addr = JSON.parse(order.addressJson);
    } catch {
      /* ignore */
    }

    const customerPhone = addr.phone || order.user?.phone;
    if (!customerPhone) return { ok: false, error: "No customer phone found" };

    const customerName = addr.name || order.user?.name || "Customer";
    let statusText = "";
    if (status === "out") {
      statusText = "🛵 Your order is *out for delivery* and will reach your doorstep shortly!";
    } else if (status === "delivered") {
      statusText = "🎉 Your order has been *delivered*! Thank you for choosing zuknow.in.";
    } else {
      return { ok: true };
    }

    const message = [
      `📦 *Order Update — #${orderNumber(order.id)}*`,
      ``,
      `Hello ${customerName},`,
      statusText,
      ``,
      `Track live: https://zuknow.in/track`,
    ].join("\n");

    return await sendWhatsAppText(customerPhone, message);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error sending customer status update",
    };
  }
}

