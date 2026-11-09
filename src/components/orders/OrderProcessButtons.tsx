import { advanceOrderAction } from "@/app/admin/actions";
import { NEXT_STATUS, statusLabel } from "@/lib/orders";

const BUTTON: Record<string, string> = {
  accepted: "Accept order",
  packing: "Start packing",
  out: "Out for delivery",
  delivered: "Mark delivered",
  cancelled: "Cancel",
};

export function OrderProcessButtons({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const next = NEXT_STATUS[status] || [];
  if (!next.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((value) => (
        <form key={value} action={advanceOrderAction}>
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="status" value={value} />
          <button
            type="submit"
            className={
              value === "cancelled"
                ? "rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600"
                : "rounded-full bg-zk-orange px-3 py-1.5 text-xs font-bold text-white"
            }
          >
            {BUTTON[value] || statusLabel(value)}
          </button>
        </form>
      ))}
    </div>
  );
}
