import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";
import { won } from "@/app/lib/format";
import { FavoriteButton } from "@/app/components/FavoriteButton";
import type { Restaurant } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">로그인이 필요합니다.</p>
        <Link href="/login" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
          로그인
        </Link>
      </div>
    );
  }

  const restaurants = await query<Restaurant>(
    `SELECT r.id, r.name, r.category, r.description, r.image_url,
            r.delivery_fee, r.min_order_amount, r.rating::float AS rating
     FROM favorites f JOIN restaurants r ON r.id = f.restaurant_id
     WHERE f.user_id = $1 ORDER BY f.id DESC`,
    [user.id],
  );

  return (
    <div>
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">❤️ 찜한 가게</h1>

      {restaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <p className="text-zinc-500">아직 찜한 가게가 없습니다.</p>
          <Link href="/" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
            가게 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-zinc-200 p-4 flex gap-3 items-center"
            >
              <Link href={`/restaurants/${r.id}`} className="text-3xl shrink-0">
                {r.image_url ?? "🍽️"}
              </Link>
              <Link href={`/restaurants/${r.id}`} className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.name}</p>
                <p className="text-xs text-zinc-400">
                  {r.category} · ⭐ {r.rating.toFixed(1)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  배달비 {won(r.delivery_fee)} · 최소 {won(r.min_order_amount)}
                </p>
              </Link>
              <FavoriteButton restaurantId={r.id} initialFavorited={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
