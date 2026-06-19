import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";

// 주문 생성: orders(헤더) + order_items(상세) 를 하나의 트랜잭션으로 저장한다.
// 가격은 클라이언트가 보낸 값을 믿지 않고 DB 에서 다시 조회해 계산한다(보안).
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { restaurantId, items, address, phone } = await req.json();
  if (
    !restaurantId ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !address
  ) {
    return NextResponse.json({ error: "주문 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 주문에 담긴 메뉴를 DB 에서 다시 조회 (가격/식당 검증 + 스냅샷용)
    const menuIds = items.map((i: { menuId: number }) => Number(i.menuId));
    const menuRows = (
      await client.query(
        "SELECT id, restaurant_id, name, price FROM menus WHERE id = ANY($1::int[])",
        [menuIds],
      )
    ).rows;
    const menuMap = new Map<number, { id: number; restaurant_id: number; name: string; price: number }>(
      menuRows.map((m) => [m.id, m]),
    );

    let menuTotal = 0;
    const lineItems: { menuId: number; name: string; price: number; qty: number }[] = [];
    for (const it of items) {
      const m = menuMap.get(Number(it.menuId));
      const qty = Number(it.quantity);
      if (!m || m.restaurant_id !== Number(restaurantId) || qty < 1) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "메뉴 정보가 올바르지 않습니다." }, { status: 400 });
      }
      menuTotal += m.price * qty;
      lineItems.push({ menuId: m.id, name: m.name, price: m.price, qty });
    }

    // 식당의 배달비/최소주문금액 검증
    const restaurant = (
      await client.query(
        "SELECT delivery_fee, min_order_amount FROM restaurants WHERE id = $1",
        [restaurantId],
      )
    ).rows[0];
    if (!restaurant) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "식당을 찾을 수 없습니다." }, { status: 400 });
    }
    if (menuTotal < restaurant.min_order_amount) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: `최소주문금액 ${restaurant.min_order_amount}원 이상이어야 합니다.` },
        { status: 400 },
      );
    }
    const totalAmount = menuTotal + restaurant.delivery_fee;

    // 1) 주문 헤더 저장
    const orderId = (
      await client.query(
        `INSERT INTO orders (user_id, restaurant_id, total_amount, status, address, phone)
         VALUES ($1, $2, $3, 'received', $4, $5) RETURNING id`,
        [user.id, restaurantId, totalAmount, address, phone ?? null],
      )
    ).rows[0].id;

    // 2) 주문 상세 저장 (주문 시점 이름/가격 스냅샷)
    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, li.menuId, li.name, li.price, li.qty],
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("주문 처리 오류:", err);
    return NextResponse.json({ error: "주문 처리 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    client.release();
  }
}
