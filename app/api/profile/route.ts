import { NextResponse } from "next/server";
import { getSessionUser, createSession } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

// 프로필(이름) 수정
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "이름을 입력하세요." }, { status: 400 });
  }
  if (name.trim().length > 100) {
    return NextResponse.json({ error: "이름이 너무 깁니다." }, { status: 400 });
  }

  const newName = name.trim();
  await query("UPDATE users SET name = $1 WHERE id = $2", [newName, user.id]);
  // 세션 쿠키의 이름도 갱신
  await createSession({ id: user.id, email: user.email, name: newName, role: user.role });

  return NextResponse.json({ user: { ...user, name: newName } });
}
