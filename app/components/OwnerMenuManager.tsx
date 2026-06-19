"use client";

import { useState } from "react";
import { won } from "@/app/lib/format";
import type { Menu } from "@/app/lib/types";

export function OwnerMenuManager({
  restaurantId,
  initialMenus,
}: {
  restaurantId: number;
  initialMenus: Menu[];
}) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [form, setForm] = useState({ name: "", description: "", price: "", imageUrl: "🍽️" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function addMenu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !(Number(form.price) > 0)) {
      return setError("메뉴 이름과 가격(0원 초과)을 입력하세요.");
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "메뉴 추가에 실패했습니다.");
        return;
      }
      setMenus((prev) => [...prev, data.menu]);
      setForm({ name: "", description: "", price: "", imageUrl: "🍽️" });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function removeMenu(menuId: number) {
    if (!window.confirm("이 메뉴를 삭제할까요?")) return;
    const res = await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
    if (res.ok) setMenus((prev) => prev.filter((m) => m.id !== menuId));
  }

  const inputCls =
    "rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="space-y-4">
      {/* 메뉴 추가 폼 */}
      <form onSubmit={addMenu} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
        <p className="font-medium text-sm">새 메뉴 추가</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="메뉴 이름" className={`${inputCls} sm:col-span-2`} />
          <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="가격(원)" className={inputCls} />
          <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="이모지 🍗" className={inputCls} />
        </div>
        <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="메뉴 설명 (선택)" className={`${inputCls} w-full`} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="rounded-md bg-teal-600 text-white text-sm px-4 py-2 hover:bg-teal-700 disabled:opacity-50">
          {loading ? "추가 중..." : "+ 메뉴 추가"}
        </button>
      </form>

      {/* 기존 메뉴 목록 */}
      {menus.length === 0 ? (
        <p className="text-center text-zinc-400 py-6">등록된 메뉴가 없습니다. 위에서 추가하세요.</p>
      ) : (
        <div className="space-y-2">
          {menus.map((m) => (
            <div key={m.id} className="bg-white rounded-lg border border-zinc-200 p-3 flex items-center justify-between gap-3">
              <div className="flex gap-3 items-center min-w-0">
                <div className="text-2xl shrink-0">{m.image_url ?? "🍽️"}</div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.name}</p>
                  <p className="text-xs text-zinc-500 line-clamp-1">{m.description}</p>
                  <p className="text-sm text-zinc-700">{won(m.price)}</p>
                </div>
              </div>
              <button onClick={() => removeMenu(m.id)} className="text-sm text-zinc-400 hover:text-red-500 shrink-0">
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
