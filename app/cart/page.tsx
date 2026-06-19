"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { won } from "@/app/lib/format";
import { validatePhone } from "@/app/lib/validation";
import type { OrderType } from "@/app/lib/types";

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const {
    restaurantId,
    restaurantName,
    items,
    hydrated,
    subtotal,
    deliveryFee,
    minOrderAmount,
    increment,
    decrement,
    removeItem,
    updateOptions,
    clearCart,
  } = useCart();

  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [request, setRequest] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-zinc-500">장바구니가 비어 있습니다.</p>
        <Link href="/" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
          식당 둘러보기
        </Link>
      </div>
    );
  }

  const appliedDeliveryFee = orderType === "delivery" ? deliveryFee : 0;
  const total = subtotal + appliedDeliveryFee;
  const belowMin = subtotal < minOrderAmount;

  async function handleOrder() {
    setError("");
    if (orderType === "delivery" && !address.trim()) {
      return setError("배달 주소를 입력하세요.");
    }
    const phoneError = validatePhone(phone);
    if (phoneError) return setError(phoneError);
    if (orderType === "delivery" && !request.trim()) {
      return setError("배달 요청사항을 입력하세요.");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          orderType,
          address: address.trim(),
          phone: phone.trim(),
          request: request.trim(),
          items: items.map((i) => ({
            menuId: i.menuId,
            quantity: i.quantity,
            options: i.options ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "주문에 실패했습니다.");
        return;
      }
      clearCart();
      router.push("/orders");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">장바구니</h1>
        <button onClick={clearCart} className="text-sm text-zinc-400 hover:text-red-500">
          전체삭제
        </button>
      </div>
      <p className="text-sm text-zinc-500 mb-4">{restaurantName}</p>

      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.menuId} className="bg-white rounded-lg border border-zinc-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {i.imageUrl ?? "🍽️"} {i.name}
                </p>
                <p className="text-sm text-zinc-500">{won(i.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => decrement(i.menuId)} className="w-7 h-7 rounded border border-zinc-300 hover:bg-zinc-50" aria-label="수량 감소">−</button>
                <span className="w-6 text-center">{i.quantity}</span>
                <button onClick={() => increment(i.menuId)} className="w-7 h-7 rounded border border-zinc-300 hover:bg-zinc-50" aria-label="수량 증가">+</button>
                <button onClick={() => removeItem(i.menuId)} className="ml-1 text-zinc-400 hover:text-red-500 text-sm">삭제</button>
              </div>
            </div>
            {/* 옵션/요청 변경 */}
            <input
              value={i.options ?? ""}
              onChange={(e) => updateOptions(i.menuId, e.target.value)}
              maxLength={100}
              placeholder="옵션/요청 (예: 덜 맵게, 양파 빼고)"
              className="mt-2 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}
      </div>

      {/* 메뉴 더 담기 */}
      {restaurantId && (
        <Link
          href={`/restaurants/${restaurantId}`}
          className="mt-2 block text-center rounded-md border border-dashed border-zinc-300 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
        >
          + 메뉴 더 담기
        </Link>
      )}

      {/* 배달/포장 선택 */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(
          [
            { v: "delivery", label: "🛵 배달" },
            { v: "takeout", label: "🥡 포장" },
          ] as { v: OrderType; label: string }[]
        ).map((opt) => (
          <button
            key={opt.v}
            onClick={() => setOrderType(opt.v)}
            className={
              orderType === opt.v
                ? "rounded-md border-2 border-teal-600 bg-teal-50 text-teal-700 py-2 text-sm font-medium"
                : "rounded-md border border-zinc-300 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-4 mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">메뉴 합계</span>
          <span>{won(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">배달비{orderType === "takeout" ? " (포장 무료)" : ""}</span>
          <span>{won(appliedDeliveryFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-zinc-100 mt-1">
          <span>총 결제금액</span>
          <span className="text-teal-700">{won(total)}</span>
        </div>
      </div>

      {belowMin && (
        <p className="text-sm text-red-500 mt-2">
          최소주문금액 {won(minOrderAmount)} 이상부터 주문할 수 있어요. (현재 {won(subtotal)})
        </p>
      )}

      {/* 주문 정보 */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4 mt-4">
        <h2 className="font-semibold mb-3">{orderType === "delivery" ? "배달 정보" : "포장 정보"}</h2>
        {loading ? null : !user ? (
          <p className="text-sm text-zinc-600">
            주문하려면{" "}
            <Link href="/login" className="text-teal-600 font-medium">로그인</Link>
            이 필요합니다.
          </p>
        ) : (
          <div className="space-y-3">
            {orderType === "delivery" && (
              <div>
                <label className="block text-sm text-zinc-600 mb-1">배달 주소 *</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="서울시 ○○구 ○○로 12, 3층"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-zinc-600 mb-1">연락처 *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">
                {orderType === "delivery" ? "배달기사님께 요청사항 * " : "요청사항 "}
                <span className="text-zinc-400">({request.length}/50)</span>
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                maxLength={50}
                rows={2}
                placeholder={orderType === "delivery" ? "문 앞에 두고 벨 눌러주세요" : "포장 요청사항"}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={handleOrder}
              disabled={submitting || belowMin}
              className="w-full rounded-md bg-teal-600 text-white py-2.5 font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? "주문 중..." : `${won(total)} 주문하기`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
