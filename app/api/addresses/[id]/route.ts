import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 주소 삭제 (본인 것만)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const addressId = Number(id);
  const owned = await query("SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2", [
    addressId,
    user.id,
  ]);
  if (owned.length === 0) {
    return NextResponse.json({ error: "본인 주소만 삭제할 수 있습니다." }, { status: 403 });
  }
  await query("DELETE FROM user_addresses WHERE id = $1", [addressId]);
  return NextResponse.json({ ok: true });
}
