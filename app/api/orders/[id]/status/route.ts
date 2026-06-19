import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

const ALLOWED = ["received", "delivering", "completed"];

// 주문 상태 변경 (해당 가게 사장님만)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);
  const { status } = await req.json();
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태입니다." }, { status: 400 });
  }

  // 이 주문이 사장님 소유 가게의 주문인지 확인
  const owned = await query(
    `SELECT 1 FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.id = $1 AND r.owner_id = $2`,
    [orderId, user.id],
  );
  if (owned.length === 0) {
    return NextResponse.json({ error: "본인 가게의 주문만 변경할 수 있습니다." }, { status: 403 });
  }

  await query("UPDATE orders SET status = $1 WHERE id = $2", [status, orderId]);
  return NextResponse.json({ status });
}
