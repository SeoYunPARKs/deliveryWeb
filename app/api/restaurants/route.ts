import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 가게 등록 (사장님 전용)
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "사장님만 가게를 등록할 수 있습니다." }, { status: 403 });
  }

  const { name, category, description, imageUrl, deliveryFee, minOrderAmount } = await req.json();
  if (!name?.trim() || !category?.trim()) {
    return NextResponse.json({ error: "가게 이름과 카테고리는 필수입니다." }, { status: 400 });
  }

  const rows = await query<{ id: number }>(
    `INSERT INTO restaurants (owner_id, name, category, description, image_url, delivery_fee, min_order_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      user.id,
      name.trim(),
      category.trim(),
      description?.trim() || null,
      imageUrl?.trim() || "🍽️",
      Math.max(0, Math.floor(Number(deliveryFee) || 0)),
      Math.max(0, Math.floor(Number(minOrderAmount) || 0)),
    ],
  );

  return NextResponse.json({ id: rows[0].id });
}
