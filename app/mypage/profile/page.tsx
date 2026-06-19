"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">로그인이 필요합니다.</p>
        <Link href="/login" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
          로그인
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!name.trim()) return setError("이름을 입력하세요.");
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "수정에 실패했습니다.");
        return;
      }
      await refresh();
      setMsg("저장되었습니다.");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-5">프로필 수정</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-zinc-200">
        <div>
          <label className="block text-sm text-zinc-600 mb-1">이메일 (변경 불가)</label>
          <input
            value={user.email}
            disabled
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-400"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="이름"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-teal-600">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-teal-600 text-white py-2.5 font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
