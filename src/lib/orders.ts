export const ORDER_PREFIX = "ZK-";

export const PROCESS_STEPS = ["paid", "accepted", "packing", "out", "delivered"] as const;

export const NEXT_STATUS: Record<string, string[]> = {
  paid: ["accepted", "cancelled"],
  accepted: ["packing", "cancelled"],
  packing: ["out", "cancelled"],
  out: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  failed: [],
  pending: [],
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for payment",
  paid: "Paid · waiting on shop",
  accepted: "Accepted",
  packing: "Packing",
  out: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

export function orderNumber(id: string) {
  return `${ORDER_PREFIX}${id.slice(-8).toUpperCase()}`;
}

export function parseOrderNumber(input: string) {
  const raw = input.trim().toUpperCase().replace(/^ZK-?/, "").replace(/[^A-Z0-9]/g, "");
  return raw.slice(-8);
}

export function statusLabel(status: string) {
  return STATUS_LABEL[status] || status;
}

export function customerHeadline(status: string, etaMinutes: number) {
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "This order was cancelled";
  if (status === "failed" || status === "pending") return "Payment not complete";
  if (status === "out") return "Rider is on the way";
  if (status === "packing" || status === "accepted") return "The shop is on it";
  return `Arriving in about ${etaMinutes} min`;
}
