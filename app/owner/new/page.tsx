"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["치킨", "분식", "피자", "카페", "한식", "중식", "일식", "디저트", "기타"];

export default function NewRestaurantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    category: "치킨",
    description: "",
    imageUrl: "🍽️",
    deliveryFee: "3000",
    minOrderAmount: "12000",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("가게 이름을 입력하세요.");
    setLoading(true);
    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "가게 등록에 실패했습니다.");
        return;
      }
      router.push(`/owner/restaurants/${data.id}`);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="max-w-md mx-auto">
      <Link href="/owner" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 내 가게 관리
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-5">가게 등록</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-zinc-200">
        <div>
          <label className="block text-sm text-zinc-600 mb-1">가게 이름</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required className={inputCls} placeholder="황금올리브치킨" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-600 mb-1">카테고리</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">대표 이모지</label>
            <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className={inputCls} placeholder="🍗" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 mb-1">소개</label>
          <input value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} placeholder="바삭한 후라이드 전문점" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-600 mb-1">배달비 (원)</label>
            <input type="number" min={0} value={form.deliveryFee} onChange={(e) => set("deliveryFee", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">최소주문 (원)</label>
            <input type="number" min={0} value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} className={inputCls} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-teal-600 text-white py-2.5 font-medium hover:bg-teal-700 disabled:opacity-50">
          {loading ? "등록 중..." : "가게 등록"}
        </button>
      </form>
    </div>
  );
}
