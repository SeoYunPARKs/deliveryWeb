import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";
import { won, statusLabel } from "@/app/lib/format";
import type { OrderSummary, OrderItem } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">주문 내역을 보려면 로그인이 필요합니다.</p>
        <Link
          href="/login"
          className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2"
        >
          로그인
        </Link>
      </div>
    );
  }

  // 주문(헤더) 목록 + 메뉴 개수
  const orders = await query<OrderSummary>(
    `SELECT o.id, o.restaurant_id, r.name AS restaurant_name,
            o.total_amount, o.status, o.address, o.created_at,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id)::int AS item_count
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.user_id = $1
     ORDER BY o.id DESC`,
    [user.id],
  );

  // 각 주문의 상세(주문상세) 한 번에 조회
  const orderIds = orders.map((o) => o.id);
  const itemsByOrder = new Map<number, OrderItem[]>();
  if (orderIds.length > 0) {
    const items = await query<OrderItem & { order_id: number }>(
      `SELECT order_id, menu_name, unit_price, quantity
       FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id`,
      [orderIds],
    );
    for (const it of items) {
      const list = itemsByOrder.get(it.order_id) ?? [];
      list.push(it);
      itemsByOrder.set(it.order_id, list);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🧾</p>
        <p className="text-zinc-500">아직 주문 내역이 없습니다.</p>
        <Link
          href="/"
          className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2"
        >
          식당 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">내 주문 내역</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/restaurants/${o.restaurant_id}`}
                className="font-semibold hover:text-teal-700"
              >
                {o.restaurant_name}
              </Link>
              <span className="text-xs rounded-full bg-teal-50 text-teal-700 px-2 py-0.5">
                {statusLabel(o.status)}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {new Date(o.created_at).toLocaleString("ko-KR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · 주문번호 #{o.id}
            </p>

            <ul className="mt-3 space-y-0.5 text-sm text-zinc-600">
              {(itemsByOrder.get(o.id) ?? []).map((it, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {it.menu_name} × {it.quantity}
                  </span>
                  <span>{won(it.unit_price * it.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-400 truncate max-w-[60%]">
                📍 {o.address}
              </span>
              <span className="font-bold text-teal-700">{won(o.total_amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
