import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { hashPassword, createSession } from "@/app/lib/auth";
import { validateEmail, validatePassword } from "@/app/lib/validation";
import type { UserRole } from "@/app/lib/types";

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();

  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "이름을 입력하세요." }, { status: 400 });
  }
  const emailError = validateEmail(email);
  if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });

  const pwError = validatePassword(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const userRole: UserRole = role === "owner" ? "owner" : "customer";

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  // 비밀번호는 bcrypt 로 해시해서 저장 (평문 저장 금지)
  const passwordHash = await hashPassword(password);
  const rows = await query<{ id: number; email: string; name: string; role: UserRole }>(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role",
    [email, passwordHash, name, userRole],
  );

  const user = rows[0];
  await createSession(user);
  return NextResponse.json({ user });
}
