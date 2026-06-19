import Link from "next/link";
import { query } from "@/app/lib/db";
import { won } from "@/app/lib/format";
import { HomeFilters } from "@/app/components/HomeFilters";
import type { Restaurant } from "@/app/lib/types";

// DB 를 매 요청마다 조회하므로 정적 프리렌더 대신 동적 렌더링
export const dynamic = "force-dynamic";

const CATEGORIES = ["전체", "치킨", "분식", "피자", "카페"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; dong?: string }>;
}) {
  const sp = await searchParams;
  const selectedCategory = sp.category || "전체";
  const selectedDong = sp.dong || "전체";

  // 배달지역(동) 선택 목록
  const dongRows = await query<{ dong: string }>(
    "SELECT DISTINCT dong FROM restaurant_areas ORDER BY dong",
  );
  const dongs = dongRows.map((d) => d.dong);

  // 조건부 필터 (카테고리 + 배달지역)
  const params: unknown[] = [];
  const conditions: string[] = [];
  let join = "";
  if (selectedDong !== "전체") {
    join = "JOIN restaurant_areas a ON a.restaurant_id = r.id";
    params.push(selectedDong);
    conditions.push(`a.dong = $${params.length}`);
  }
  if (selectedCategory !== "전체") {
    params.push(selectedCategory);
    conditions.push(`r.category = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const restaurants = await query<Restaurant>(
    `SELECT DISTINCT r.id, r.name, r.category, r.description, r.image_url,
            r.delivery_fee, r.min_order_amount, r.rating::float AS rating
     FROM restaurants r ${join} ${where} ORDER BY r.id`,
    params,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">맛집 둘러보기</h1>
      <p className="text-zinc-500 text-sm mb-5">먹고 싶은 메뉴를 골라 주문해 보세요.</p>

      <HomeFilters
        categories={CATEGORIES}
        dongs={dongs}
        selectedCategory={selectedCategory}
        selectedDong={selectedDong}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {restaurants.map((r) => (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition flex gap-4"
          >
            <div className="text-4xl shrink-0">{r.image_url ?? "🍽️"}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold truncate">{r.name}</h2>
                <span className="text-sm text-amber-500 shrink-0">⭐ {r.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-zinc-400">{r.category}</p>
              <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{r.description}</p>
              <p className="text-xs text-zinc-500 mt-2">
                배달비 {won(r.delivery_fee)} · 최소주문 {won(r.min_order_amount)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {restaurants.length === 0 && (
        <p className="text-center text-zinc-400 py-10">
          {selectedDong !== "전체"
            ? `'${selectedDong}'에 배달 가능한 식당이 없습니다.`
            : "조건에 맞는 식당이 없습니다."}
        </p>
      )}
    </div>
  );
}
