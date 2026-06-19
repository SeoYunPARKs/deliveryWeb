import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";

// 가게 등록 (사장님 전용). 주소 + 배달 가능 지역(동)을 함께 저장.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "사장님만 가게를 등록할 수 있습니다." }, { status: 403 });
  }

  const { name, category, description, imageUrl, address, deliveryFee, minOrderAmount, areas } =
    await req.json();
  if (!name?.trim() || !category?.trim()) {
    return NextResponse.json({ error: "가게 이름과 카테고리는 필수입니다." }, { status: 400 });
  }

  // "역삼동, 삼성동" 같은 입력을 동 목록으로 파싱
  const dongs = [
    ...new Set(
      String(areas ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const restaurantId = (
      await client.query(
        `INSERT INTO restaurants (owner_id, name, category, description, image_url, address, delivery_fee, min_order_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          user.id,
          name.trim(),
          category.trim(),
          description?.trim() || null,
          imageUrl?.trim() || "🍽️",
          address?.trim() || null,
          Math.max(0, Math.floor(Number(deliveryFee) || 0)),
          Math.max(0, Math.floor(Number(minOrderAmount) || 0)),
        ],
      )
    ).rows[0].id;

    for (const dong of dongs) {
      await client.query("INSERT INTO restaurant_areas (restaurant_id, dong) VALUES ($1, $2)", [
        restaurantId,
        dong,
      ]);
    }

    await client.query("COMMIT");
    return NextResponse.json({ id: restaurantId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("가게 등록 오류:", err);
    return NextResponse.json({ error: "가게 등록 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    client.release();
  }
}
