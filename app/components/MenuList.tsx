"use client";

import { useCart } from "@/app/components/CartProvider";
import { won } from "@/app/lib/format";
import type { Menu, Restaurant } from "@/app/lib/types";

export function MenuList({
  restaurant,
  menus,
}: {
  restaurant: Restaurant;
  menus: Menu[];
}) {
  const { addItem } = useCart();

  return (
    <div className="space-y-2">
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
          <button
            onClick={() =>
              addItem(
                {
                  id: restaurant.id,
                  name: restaurant.name,
                  deliveryFee: restaurant.delivery_fee,
                  minOrderAmount: restaurant.min_order_amount,
                },
                {
                  menuId: m.id,
                  name: m.name,
                  price: m.price,
                  quantity: 1,
                  imageUrl: m.image_url,
                },
              )
            }
            className="shrink-0 rounded-md bg-teal-600 text-white text-sm px-3 py-1.5 hover:bg-teal-700"
          >
            담기
          </button>
        </div>
      ))}
    </div>
  );
}
