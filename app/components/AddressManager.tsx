"use client";

import { useState } from "react";

type Addr = { id: number; label: string | null; address: string };

export function AddressManager({ initial }: { initial: Addr[] }) {
  const [list, setList] = useState<Addr[]>(initial);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!address.trim()) return setError("주소를 입력하세요.");
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "추가에 실패했습니다.");
        return;
      }
      setList((prev) => [data.address, ...prev]);
      setLabel("");
      setAddress("");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("이 주소를 삭제할까요?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) setList((prev) => prev.filter((a) => a.id !== id));
  }

  const inputCls =
    "rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2">
        <p className="font-medium text-sm">새 주소 추가</p>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="별칭 (집, 회사 등 - 선택)"
          className={`${inputCls} w-full`}
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="서울시 ○○구 ○○로 12, 3층"
          className={`${inputCls} w-full`}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 text-white text-sm px-4 py-2 hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "추가 중..." : "+ 주소 추가"}
        </button>
      </form>

      {list.length === 0 ? (
        <p className="text-center text-zinc-400 py-6">저장된 주소가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {list.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg border border-zinc-200 p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                {a.label && (
                  <span className="inline-block text-xs rounded-full bg-teal-50 text-teal-700 px-2 py-0.5 mb-1">
                    {a.label}
                  </span>
                )}
                <p className="text-sm text-zinc-700 truncate">📍 {a.address}</p>
              </div>
              <button
                onClick={() => remove(a.id)}
                className="text-sm text-zinc-400 hover:text-red-500 shrink-0"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
