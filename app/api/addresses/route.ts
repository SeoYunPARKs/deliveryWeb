import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 주소 추가
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { label, address } = await req.json();
  if (!address?.trim()) {
    return NextResponse.json({ error: "주소를 입력하세요." }, { status: 400 });
  }
  const rows = await query<{ id: number; label: string | null; address: string }>(
    "INSERT INTO user_addresses (user_id, label, address) VALUES ($1, $2, $3) RETURNING id, label, address",
    [user.id, label?.trim() || null, address.trim()],
  );
  return NextResponse.json({ address: rows[0] });
}
