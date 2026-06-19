import Link from "next/link";
import { query } from "@/app/lib/db";
import { won } from "@/app/lib/format";
import type { Restaurant } from "@/app/lib/types";

// DB 를 매 요청마다 조회하므로 정적 프리렌더 대신 동적 렌더링
export const dynamic = "force-dynamic";

const CATEGORIES = ["전체", "치킨", "분식", "피자", "카페"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected = category && category !== "전체" ? category : null;

  const restaurants = selected
    ? await query<Restaurant>(
        `SELECT id, name, category, description, image_url, delivery_fee, min_order_amount, rating::float AS rating
         FROM restaurants WHERE category = $1 ORDER BY id`,
        [selected],
      )
    : await query<Restaurant>(
        `SELECT id, name, category, description, image_url, delivery_fee, min_order_amount, rating::float AS rating
         FROM restaurants ORDER BY id`,
      );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">맛집 둘러보기</h1>
      <p className="text-zinc-500 text-sm mb-5">먹고 싶은 메뉴를 골라 주문해 보세요.</p>

      {/* 카테고리 필터 (가산 기능) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => {
          const active = (selected ?? "전체") === c;
          const href = c === "전체" ? "/" : `/?category=${encodeURIComponent(c)}`;
          return (
            <Link
              key={c}
              href={href}
              className={
                active
                  ? "rounded-full bg-teal-600 text-white text-sm px-4 py-1.5"
                  : "rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm px-4 py-1.5 hover:bg-zinc-50"
              }
            >
              {c}
            </Link>
          );
        })}
      </div>

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
        <p className="text-center text-zinc-400 py-10">해당 카테고리의 식당이 없습니다.</p>
      )}
    </div>
  );
}
