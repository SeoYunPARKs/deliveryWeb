"use client";

import { useState } from "react";
import { useCart } from "@/app/components/CartProvider";
import { won } from "@/app/lib/format";
import type { Menu, Restaurant } from "@/app/lib/types";

export function MenuList({
  restaurant,
  menus,
  isOwner = false,
}: {
  restaurant: Restaurant;
  menus: Menu[];
  isOwner?: boolean;
}) {
  const { addItem } = useCart();
  const [toast, setToast] = useState<string | null>(null);

  function handleAdd(menu: Menu) {
    addItem(
      {
        id: restaurant.id,
        name: restaurant.name,
        deliveryFee: restaurant.delivery_fee,
        minOrderAmount: restaurant.min_order_amount,
      },
      {
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        imageUrl: menu.image_url,
      },
    );
    setToast(`${menu.name} 담았어요 🛒`);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <div className="space-y-2">
      {isOwner && (
        <p className="text-xs text-zinc-500 bg-zinc-100 rounded-md px-3 py-2">
          내 가게입니다 — 손님 화면 미리보기 (담기 비활성화)
        </p>
      )}

      {menus.map((m) => (
        <div
          key={m.id}
          className="bg-white rounded-lg border border-zinc-200 p-4 flex items-center justify-between gap-3"
        >
          <div className="flex gap-3 items-center min-w-0">
            <div className="text-2xl shrink-0">{m.image_url ?? "🍽️"}</div>
            <div className="min-w-0">
              <p className="font-medium truncate">{m.name}</p>
              <p className="text-xs text-zinc-500 line-clamp-1">{m.description}</p>
              <p className="text-sm text-zinc-700 mt-0.5">{won(m.price)}</p>
            </div>
          </div>
          {!isOwner && (
            <button
              onClick={() => handleAdd(m)}
              className="shrink-0 rounded-md bg-teal-600 text-white text-sm px-3 py-1.5 hover:bg-teal-700"
            >
              담기
            </button>
          )}
        </div>
      ))}

      {/* 담김 토스트 (CR-13) */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
