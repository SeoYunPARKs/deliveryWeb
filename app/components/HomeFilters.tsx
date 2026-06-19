"use client";

import { useRouter } from "next/navigation";

export function HomeFilters({
  categories,
  dongs,
  selectedCategory,
  selectedDong,
}: {
  categories: string[];
  dongs: string[];
  selectedCategory: string;
  selectedDong: string;
}) {
  const router = useRouter();

  function navigate(category: string, dong: string) {
    const params = new URLSearchParams();
    if (category && category !== "전체") params.set("category", category);
    if (dong && dong !== "전체") params.set("dong", dong);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="mb-6 space-y-3">
      {/* 배달 지역(동) 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">📍 우리 동네</span>
        <select
          value={selectedDong}
          onChange={(e) => navigate(selectedCategory, e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="전체">전체 지역</option>
          {dongs.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* 카테고리 칩 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = selectedCategory === c;
          return (
            <button
              key={c}
              onClick={() => navigate(c, selectedDong)}
              className={
                active
                  ? "rounded-full bg-teal-600 text-white text-sm px-4 py-1.5"
                  : "rounded-full bg-white border border-zinc-200 text-zinc-600 text-sm px-4 py-1.5 hover:bg-zinc-50"
              }
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
