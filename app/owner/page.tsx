import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";
import { won } from "@/app/lib/format";
import type { Restaurant } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function OwnerDashboard() {
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
  if (user.role !== "owner") {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">사장님 전용 페이지입니다. (현재 손님 계정)</p>
        <Link href="/" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
          홈으로
        </Link>
      </div>
    );
  }

  const restaurants = await query<Restaurant>(
    `SELECT id, name, category, description, image_url, delivery_fee, min_order_amount, rating::float AS rating
     FROM restaurants WHERE owner_id = $1 ORDER BY id DESC`,
    [user.id],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">내 가게 관리</h1>
        <Link href="/owner/new" className="rounded-md bg-teal-600 text-white text-sm px-4 py-2 hover:bg-teal-700">
          + 가게 등록
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-zinc-500">아직 등록한 가게가 없습니다.</p>
          <Link href="/owner/new" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
            첫 가게 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/owner/restaurants/${r.id}`}
              className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition flex gap-3"
            >
              <div className="text-3xl shrink-0">{r.image_url ?? "🍽️"}</div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.name}</p>
                <p className="text-xs text-zinc-400">{r.category}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  배달비 {won(r.delivery_fee)} · 최소 {won(r.min_order_amount)}
                </p>
                <p className="text-xs text-teal-600 mt-1">메뉴 관리 →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
