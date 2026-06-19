import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 메뉴 삭제 (해당 가게 사장님 전용)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const menuId = Number(id);

  // 메뉴가 이 사장님 소유 가게의 것인지 확인
  const owned = await query(
    `SELECT m.id FROM menus m
     JOIN restaurants r ON r.id = m.restaurant_id
     WHERE m.id = $1 AND r.owner_id = $2`,
    [menuId, user.id],
  );
  if (owned.length === 0) {
    return NextResponse.json({ error: "본인 가게의 메뉴만 삭제할 수 있습니다." }, { status: 403 });
  }

  await query("DELETE FROM menus WHERE id = $1", [menuId]);
  return NextResponse.json({ ok: true });
}
