import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";
import { won } from "@/app/lib/format";
import { OwnerMenuManager } from "@/app/components/OwnerMenuManager";
import { OwnerOrders } from "@/app/components/OwnerOrders";
import type { Restaurant, Menu } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function OwnerRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "owner") {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">사장님 전용 페이지입니다.</p>
        <Link href="/" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">홈으로</Link>
      </div>
    );
  }

  const { id } = await params;
  const restaurantId = Number(id);
  const rows = await query<Restaurant>(
    `SELECT id, name, category, description, image_url, delivery_fee, min_order_amount, rating::float AS rating
     FROM restaurants WHERE id = $1 AND owner_id = $2`,
    [restaurantId, user.id],
  );
  const restaurant = rows[0];
  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">가게를 찾을 수 없거나 권한이 없습니다.</p>
        <Link href="/owner" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">내 가게 관리</Link>
      </div>
    );
  }

  const menus = await query<Menu>(
    "SELECT id, restaurant_id, name, description, price, image_url FROM menus WHERE restaurant_id = $1 ORDER BY id",
    [restaurantId],
  );

  const orders = await query<{
    id: number;
    created_at: string;
    total_amount: number;
    order_type: string;
    status: string;
    address: string;
    items: string | null;
  }>(
    `SELECT o.id, o.created_at, o.total_amount, o.order_type, o.status, o.address,
            (SELECT string_agg(oi.menu_name || ' x' || oi.quantity, ', ')
             FROM order_items oi WHERE oi.order_id = o.id) AS items
     FROM orders o WHERE o.restaurant_id = $1 ORDER BY o.id DESC`,
    [restaurantId],
  );

  return (
    <div>
      <Link href="/owner" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 내 가게 관리
      </Link>
      <div className="bg-white rounded-xl border border-zinc-200 p-5 mt-3 flex gap-4 items-center">
        <div className="text-4xl shrink-0">{restaurant.image_url ?? "🍽️"}</div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <p className="text-sm text-zinc-400">{restaurant.category}</p>
          <p className="text-xs text-zinc-500 mt-1">
            배달비 {won(restaurant.delivery_fee)} · 최소주문 {won(restaurant.min_order_amount)}
          </p>
        </div>
        <Link
          href={`/restaurants/${restaurant.id}`}
          className="ml-auto text-sm text-teal-600 hover:underline shrink-0"
        >
          손님 화면 보기 →
        </Link>
      </div>

      <h2 className="font-bold mt-6 mb-3">주문 관리</h2>
      <OwnerOrders initial={orders} />

      <h2 className="font-bold mt-6 mb-3">메뉴 관리</h2>
      <OwnerMenuManager restaurantId={restaurant.id} initialMenus={menus} />
    </div>
  );
}
