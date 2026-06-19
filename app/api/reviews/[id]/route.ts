import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 리뷰 수정 (본인 리뷰만)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const reviewId = Number(id);
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

  const owned = await query("SELECT id FROM reviews WHERE id = $1 AND user_id = $2", [
    reviewId,
    user.id,
  ]);
  if (owned.length === 0) {
    return NextResponse.json({ error: "본인 리뷰만 수정할 수 있습니다." }, { status: 403 });
  }

  const rows = await query<{ id: number; rating: number; content: string; created_at: string }>(
    "UPDATE reviews SET rating = $1, content = $2 WHERE id = $3 RETURNING id, rating, content, created_at",
    [r, content.trim(), reviewId],
  );
  return NextResponse.json({ review: { ...rows[0], user_name: user.name, user_id: user.id } });
}

// 리뷰 삭제 (본인 리뷰만)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const reviewId = Number(id);

  const owned = await query("SELECT id FROM reviews WHERE id = $1 AND user_id = $2", [
    reviewId,
    user.id,
  ]);
  if (owned.length === 0) {
    return NextResponse.json({ error: "본인 리뷰만 삭제할 수 있습니다." }, { status: 403 });
  }

  await query("DELETE FROM reviews WHERE id = $1", [reviewId]);
  return NextResponse.json({ ok: true });
}
