"use client";

import { useState } from "react";
import { won, statusLabel } from "@/app/lib/format";

type OwnerOrder = {
  id: number;
  created_at: string;
  total_amount: number;
  order_type: string;
  status: string;
  address: string;
  items: string | null;
};

// 현재 상태 -> 다음 단계로 넘기는 버튼 (한 번에 하나씩)
const NEXT: Record<string, { to: string; label: string }> = {
  pending: { to: "received", label: "접수" },
  received: { to: "delivering", label: "배달 중" },
  delivering: { to: "completed", label: "완료" },
};

export function OwnerOrders({ initial }: { initial: OwnerOrder[] }) {
  const [orders, setOrders] = useState<OwnerOrder[]>(initial);
  const [showDone, setShowDone] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function advance(orderId: number, to: string) {
    setBusyId(orderId);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: to } : o)));
    }
    setBusyId(null);
  }

  if (orders.length === 0) {
    return <p className="text-center text-zinc-400 py-6">아직 들어온 주문이 없습니다.</p>;
  }

  // 진행 중(신규·접수·배달중) / 완료 분리
  const active = orders.filter((o) => o.status !== "completed");
  const done = orders.filter((o) => o.status === "completed");

  function dateText(s: string) {
    return new Date(s).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="space-y-4">
      {/* 진행 중인 주문 */}
      {active.length === 0 ? (
        <p className="text-center text-zinc-400 py-6">진행 중인 주문이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {active.map((o) => {
            const next = NEXT[o.status];
            const isNew = o.status === "pending";
            return (
              <div
                key={o.id}
                className={
                  "bg-white rounded-lg border p-4 " +
                  (isNew ? "border-teal-400 ring-1 ring-teal-200" : "border-zinc-200")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {isNew && <span className="text-teal-600 mr-1">🔔 신규</span>}
                    주문 #{o.id} · {o.order_type === "takeout" ? "🥡 포장" : "🛵 배달"}
                  </span>
                  <span className="text-sm font-bold text-teal-700">{won(o.total_amount)}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{o.items}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  📍 {o.address} · {dateText(o.created_at)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs rounded-full bg-zinc-100 text-zinc-600 px-2 py-0.5">
                    현재: {statusLabel(o.status)}
                  </span>
                  {next && (
                    <button
                      onClick={() => advance(o.id, next.to)}
                      disabled={busyId === o.id}
                      className="rounded-md bg-teal-600 text-white text-sm px-5 py-1.5 font-medium hover:bg-teal-700 disabled:opacity-50"
                    >
                      {busyId === o.id ? "처리 중..." : next.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 완료된 주문: 따로 모아서 접어두기 */}
      {done.length > 0 && (
        <div className="border-t border-zinc-100 pt-3">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ✅ 완료된 주문 {done.length}건 {showDone ? "접기 ▲" : "보기 ▼"}
          </button>
          {showDone && (
            <div className="space-y-2 mt-2">
              {done.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-50 rounded-lg border border-zinc-200 p-3 text-zinc-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      주문 #{o.id} · {o.order_type === "takeout" ? "🥡 포장" : "🛵 배달"}
                    </span>
                    <span className="text-sm font-medium">{won(o.total_amount)}</span>
                  </div>
                  <p className="text-xs mt-1">{o.items}</p>
                  <p className="text-xs mt-0.5">📍 {o.address} · {dateText(o.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
