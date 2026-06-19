import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";
import { won } from "@/app/lib/format";
import { MenuList } from "@/app/components/MenuList";
import { ReviewSection } from "@/app/components/ReviewSection";
import { FavoriteButton } from "@/app/components/FavoriteButton";
import type { Restaurant, Menu, Review } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantId = Number(id);
  const sessionUser = await getSessionUser();

  const restaurants = await query<Restaurant>(
    `SELECT id, owner_id, name, category, description, image_url, address,
            delivery_fee, min_order_amount, rating::float AS rating
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
    `SELECT rv.id, rv.user_id, u.name AS user_name, rv.rating, rv.content, rv.created_at
     FROM reviews rv JOIN users u ON u.id = rv.user_id
     WHERE rv.restaurant_id = $1 ORDER BY rv.id DESC`,
    [restaurantId],
  );

  // 본인 소유 가게인지 (담기 숨김용)
  const isOwner =
    !!sessionUser && sessionUser.role === "owner" && restaurant.owner_id === sessionUser.id;

  // 리뷰 작성 권한: 로그인 + 이 식당 주문 이력 있음
  let canReview = false;
  let favorited = false;
  if (sessionUser) {
    const ordered = await query(
      "SELECT 1 FROM orders WHERE user_id = $1 AND restaurant_id = $2 LIMIT 1",
      [sessionUser.id, restaurantId],
    );
    canReview = ordered.length > 0;
    const fav = await query(
      "SELECT 1 FROM favorites WHERE user_id = $1 AND restaurant_id = $2 LIMIT 1",
      [sessionUser.id, restaurantId],
    );
    favorited = fav.length > 0;
  }

  return (
    <div>
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 목록으로
      </Link>

      <div className="bg-white rounded-xl border border-zinc-200 p-5 mt-3 flex gap-4 items-center">
        <div className="text-5xl shrink-0">{restaurant.image_url ?? "🍽️"}</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <p className="text-sm text-zinc-400">
            {restaurant.category} · ⭐ {restaurant.rating.toFixed(1)}
          </p>
          <p className="text-sm text-zinc-500 mt-1">{restaurant.description}</p>
          {restaurant.address && (
            <p className="text-xs text-zinc-400 mt-1">📍 {restaurant.address}</p>
          )}
          <p className="text-xs text-zinc-500 mt-2">
            배달비 {won(restaurant.delivery_fee)} · 최소주문 {won(restaurant.min_order_amount)}
          </p>
        </div>
        <FavoriteButton restaurantId={restaurant.id} initialFavorited={favorited} />
      </div>

      <h2 className="font-bold mt-6 mb-3">메뉴</h2>
      <MenuList restaurant={restaurant} menus={menus} isOwner={isOwner} />

      <ReviewSection
        restaurantId={restaurant.id}
        initialReviews={reviews}
        canReview={canReview}
        currentUserId={sessionUser?.id ?? null}
      />
    </div>
  );
}
