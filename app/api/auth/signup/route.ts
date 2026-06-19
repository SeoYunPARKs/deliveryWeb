import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { hashPassword, createSession } from "@/app/lib/auth";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "이메일, 비밀번호, 이름을 모두 입력하세요." }, { status: 400 });
  }
  if (String(password).length < 4) {
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
  }

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const rows = await query<{ id: number; email: string; name: string }>(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
    [email, passwordHash, name],
  );

  const user = rows[0];
  await createSession(user);
  return NextResponse.json({ user });
}
