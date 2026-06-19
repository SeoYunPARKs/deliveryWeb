"use client";

import { useState } from "react";
import { won } from "@/app/lib/format";

type OwnerOrder = {
  id: number;
  created_at: string;
  total_amount: number;
  order_type: string;
  status: string;
  address: string;
  items: string | null;
};

const STATUSES: { value: string; label: string }[] = [
  { value: "received", label: "접수" },
  { value: "delivering", label: "배달중" },
  { value: "completed", label: "완료" },
];

export function OwnerOrders({ initial }: { initial: OwnerOrder[] }) {
  const [orders, setOrders] = useState<OwnerOrder[]>(initial);

  async function setStatus(orderId: number, status: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  }

  if (orders.length === 0) {
    return <p className="text-center text-zinc-400 py-6">아직 들어온 주문이 없습니다.</p>;
  }

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              주문 #{o.id} · {o.order_type === "takeout" ? "🥡 포장" : "🛵 배달"}
            </span>
            <span className="text-sm font-bold text-teal-700">{won(o.total_amount)}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{o.items}</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            📍 {o.address} · {new Date(o.created_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
          </p>

          {/* 상태 단계 버튼 */}
          <div className="flex gap-1 mt-3">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(o.id, s.value)}
                className={
                  o.status === s.value
                    ? "flex-1 rounded-md bg-teal-600 text-white text-sm py-1.5 font-medium"
                    : "flex-1 rounded-md border border-zinc-300 text-zinc-600 text-sm py-1.5 hover:bg-zinc-50"
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
