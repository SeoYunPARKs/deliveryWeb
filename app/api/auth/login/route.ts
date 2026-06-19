import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { verifyPassword, createSession } from "@/app/lib/auth";
import type { UserRole } from "@/app/lib/types";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
  }

  const rows = await query<{
    id: number;
    email: string;
    name: string;
    role: UserRole;
    password_hash: string;
  }>("SELECT id, email, name, role, password_hash FROM users WHERE email = $1", [email]);
  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
