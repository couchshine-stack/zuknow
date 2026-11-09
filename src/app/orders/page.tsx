"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatInr } from "@/lib/utils";
import { orderNumber, statusLabel } from "@/lib/orders";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  etaMinutes: number;
  createdAt: string;
};

export default function OrdersPage() {
  const { user, loading, openLogin } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data: { orders: OrderRow[] }) => setOrders(data.orders || []));
  }, [user]);

  if (loading) return <p>Loading…</p>;
  if (!user) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center ring-1 ring-zk-line">
        <p>Login to see orders.</p>
        <button className="btn-primary mt-4" onClick={() => openLogin("/orders")}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold text-zk-navy">Orders</h1>
        <Link href="/track" className="text-sm font-bold text-zk-blue">
          Track with order number
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="text-zk-ink/60">No orders yet. The 15-minute clock starts after checkout.</p>
      ) : (
        orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between rounded-3xl bg-white p-4 ring-1 ring-zk-line"
          >
            <div>
              <p className="font-display font-bold text-zk-navy">{orderNumber(order.id)}</p>
              <p className="text-sm text-zk-ink/55">{statusLabel(order.status)}</p>
            </div>
            <p className="font-bold">{formatInr(order.total)}</p>
          </Link>
        ))
      )}
    </div>
  );
}
