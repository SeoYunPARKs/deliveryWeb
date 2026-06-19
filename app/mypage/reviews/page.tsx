import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";
import { MyReviewList } from "@/app/components/MyReviewList";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
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

  const reviews = await query<{
    id: number;
    restaurant_id: number;
    restaurant_name: string;
    rating: number;
    content: string;
    created_at: string;
  }>(
    `SELECT rv.id, rv.restaurant_id, r.name AS restaurant_name, rv.rating, rv.content, rv.created_at
     FROM reviews rv JOIN restaurants r ON r.id = rv.restaurant_id
     WHERE rv.user_id = $1 ORDER BY rv.id DESC`,
    [user.id],
  );

  return (
    <div>
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">✍️ 내가 쓴 리뷰</h1>
      <MyReviewList initial={reviews} />
    </div>
  );
}
