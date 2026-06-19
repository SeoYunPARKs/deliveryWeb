import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import { validatePhone } from "@/app/lib/validation";

// 주문 생성: orders(헤더) + order_items(상세) 를 하나의 트랜잭션으로 저장한다.
// 가격은 클라이언트가 보낸 값을 믿지 않고 DB 에서 다시 조회해 계산한다(보안).
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const { restaurantId, items, phone, request } = body;
  const orderType = body.orderType === "takeout" ? "takeout" : "delivery";
  const address = (body.address ?? "").trim();
  const requestText = (request ?? "").trim();

  if (!restaurantId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "주문 정보가 올바르지 않습니다." }, { status: 400 });
  }

  // 연락처: 필수 + 형식 검증 (배달/포장 공통)
  const phoneError = validatePhone(phone ?? "");
  if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });

  // 요청사항: 최대 50자. 배달은 필수.
  if (requestText.length > 50) {
    return NextResponse.json({ error: "요청사항은 50자 이내로 입력하세요." }, { status: 400 });
  }
  if (orderType === "delivery" && !address) {
    return NextResponse.json({ error: "배달 주소를 입력하세요." }, { status: 400 });
  }
  if (orderType === "delivery" && !requestText) {
    return NextResponse.json({ error: "배달 요청사항을 입력하세요." }, { status: 400 });
  }
  const finalAddress = orderType === "takeout" ? address || "매장 픽업" : address;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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
    const lineItems: {
      menuId: number;
      name: string;
      price: number;
      qty: number;
      options: string | null;
    }[] = [];
    for (const it of items) {
      const m = menuMap.get(Number(it.menuId));
      const qty = Number(it.quantity);
      if (!m || m.restaurant_id !== Number(restaurantId) || qty < 1) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "메뉴 정보가 올바르지 않습니다." }, { status: 400 });
      }
      const opt = (it.options ?? "").toString().trim().slice(0, 100) || null;
      menuTotal += m.price * qty;
      lineItems.push({ menuId: m.id, name: m.name, price: m.price, qty, options: opt });
    }

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
    // 배달비는 배달 주문에만 부과
    const deliveryFee = orderType === "delivery" ? restaurant.delivery_fee : 0;
    const totalAmount = menuTotal + deliveryFee;

    const orderId = (
      await client.query(
        `INSERT INTO orders (user_id, restaurant_id, order_type, total_amount, status, address, phone, request)
         VALUES ($1, $2, $3, $4, 'received', $5, $6, $7) RETURNING id`,
        [user.id, restaurantId, orderType, totalAmount, finalAddress, phone, requestText || null],
      )
    ).rows[0].id;

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, unit_price, quantity, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, li.menuId, li.name, li.price, li.qty, li.options],
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
