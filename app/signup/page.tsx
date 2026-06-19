"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { validateEmail, validatePassword } from "@/app/lib/validation";
import type { UserRole } from "@/app/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // 클라이언트 1차 검증 (서버에서도 동일하게 재검증)
    if (!name.trim()) return setError("이름을 입력하세요.");
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다.");
        return;
      }
      await refresh();
      router.push(role === "owner" ? "/owner" : "/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-zinc-200">
        {/* 역할 선택 */}
        <div>
          <label className="block text-sm text-zinc-600 mb-1">가입 유형</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "customer", label: "🙋 손님" },
                { v: "owner", label: "🧑‍🍳 사장님" },
              ] as { v: UserRole; label: string }[]
            ).map((opt) => (
              <button
                type="button"
                key={opt.v}
                onClick={() => setRole(opt.v)}
                className={
                  role === opt.v
                    ? "rounded-md border-2 border-teal-600 bg-teal-50 text-teal-700 py-2 text-sm font-medium"
                    : "rounded-md border border-zinc-300 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="••••••••"
          />
          <p className="text-xs text-zinc-400 mt-1">8자 이상, 영문 대·소문자와 특수문자 포함</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-600 text-white py-2.5 font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
      <p className="text-sm text-zinc-500 mt-4 text-center">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-teal-600 font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
