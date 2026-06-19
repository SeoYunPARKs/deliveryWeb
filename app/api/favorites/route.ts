import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 찜 추가
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { restaurantId } = await req.json();
  if (!restaurantId) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  await query(
    `INSERT INTO favorites (user_id, restaurant_id) VALUES ($1, $2)
     ON CONFLICT (user_id, restaurant_id) DO NOTHING`,
    [user.id, restaurantId],
  );
  return NextResponse.json({ favorited: true });
}

// 찜 해제 (?restaurantId=5)
export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const restaurantId = Number(new URL(req.url).searchParams.get("restaurantId"));
  if (!restaurantId) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  await query("DELETE FROM favorites WHERE user_id = $1 AND restaurant_id = $2", [
    user.id,
    restaurantId,
  ]);
  return NextResponse.json({ favorited: false });
}
