import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 리뷰 작성 (로그인 필요)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const restaurantId = Number(id);
  const { rating, content } = await req.json();
  const r = Number(rating);

  if (!(r >= 1 && r <= 5)) {
    return NextResponse.json({ error: "별점은 1~5점이어야 합니다." }, { status: 400 });
  }
  if (!content?.trim()) {
    return NextResponse.json({ error: "리뷰 내용을 입력하세요." }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "리뷰는 500자 이내로 작성하세요." }, { status: 400 });
  }

  const exists = await query("SELECT id FROM restaurants WHERE id = $1", [restaurantId]);
  if (exists.length === 0) {
    return NextResponse.json({ error: "식당을 찾을 수 없습니다." }, { status: 404 });
  }

  const rows = await query<{ id: number; rating: number; content: string; created_at: string }>(
    `INSERT INTO reviews (restaurant_id, user_id, rating, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, rating, content, created_at`,
    [restaurantId, user.id, r, content.trim()],
  );

  return NextResponse.json({ review: { ...rows[0], user_name: user.name } });
}
