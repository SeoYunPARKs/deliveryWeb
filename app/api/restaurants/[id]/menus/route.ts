import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 메뉴 등록 (해당 가게 사장님 전용)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "사장님만 메뉴를 등록할 수 있습니다." }, { status: 403 });
  }

  const { id } = await params;
  const restaurantId = Number(id);

  const owned = await query("SELECT id FROM restaurants WHERE id = $1 AND owner_id = $2", [
    restaurantId,
    user.id,
  ]);
  if (owned.length === 0) {
    return NextResponse.json({ error: "본인 가게에만 메뉴를 추가할 수 있습니다." }, { status: 403 });
  }

  const { name, description, price, imageUrl } = await req.json();
  if (!name?.trim() || !(Number(price) > 0)) {
    return NextResponse.json({ error: "메뉴 이름과 가격(0원 초과)을 입력하세요." }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO menus (restaurant_id, name, description, price, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, restaurant_id, name, description, price, image_url`,
    [restaurantId, name.trim(), description?.trim() || null, Math.floor(Number(price)), imageUrl?.trim() || "🍽️"],
  );

  return NextResponse.json({ menu: rows[0] });
}
