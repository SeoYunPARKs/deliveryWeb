import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/app/lib/db";
import { won } from "@/app/lib/format";
import { MenuList } from "@/app/components/MenuList";
import { ReviewSection } from "@/app/components/ReviewSection";
import type { Restaurant, Menu, Review } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantId = Number(id);

  const restaurants = await query<Restaurant>(
    `SELECT id, name, category, description, image_url, delivery_fee, min_order_amount, rating::float AS rating
     FROM restaurants WHERE id = $1`,
    [restaurantId],
  );
  const restaurant = restaurants[0];
  if (!restaurant) notFound();

  const menus = await query<Menu>(
    `SELECT id, restaurant_id, name, description, price, image_url
     FROM menus WHERE restaurant_id = $1 ORDER BY id`,
    [restaurantId],
  );

  const reviews = await query<Review>(
    `SELECT rv.id, u.name AS user_name, rv.rating, rv.content, rv.created_at
     FROM reviews rv JOIN users u ON u.id = rv.user_id
     WHERE rv.restaurant_id = $1 ORDER BY rv.id DESC`,
    [restaurantId],
  );

  return (
    <div>
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 목록으로
      </Link>

      <div className="bg-white rounded-xl border border-zinc-200 p-5 mt-3 flex gap-4 items-center">
        <div className="text-5xl shrink-0">{restaurant.image_url ?? "🍽️"}</div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <p className="text-sm text-zinc-400">
            {restaurant.category} · ⭐ {restaurant.rating.toFixed(1)}
          </p>
          <p className="text-sm text-zinc-500 mt-1">{restaurant.description}</p>
          <p className="text-xs text-zinc-500 mt-2">
            배달비 {won(restaurant.delivery_fee)} · 최소주문 {won(restaurant.min_order_amount)}
          </p>
        </div>
      </div>

      <h2 className="font-bold mt-6 mb-3">메뉴</h2>
      <MenuList restaurant={restaurant} menus={menus} />

      <ReviewSection restaurantId={restaurant.id} initialReviews={reviews} />
    </div>
  );
}
