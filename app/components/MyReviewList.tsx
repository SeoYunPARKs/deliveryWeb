"use client";

import { useState } from "react";
import Link from "next/link";

type MyReview = {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  rating: number;
  content: string;
  created_at: string;
};

function Stars({ n, onPick }: { n: number; onPick?: (v: number) => void }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) =>
        onPick ? (
          <button
            type="button"
            key={s}
            onClick={() => onPick(s)}
            className={s <= n ? "text-amber-500 text-xl" : "text-zinc-300 text-xl"}
          >
            ★
          </button>
        ) : (
          <span key={s} className={s <= n ? "text-amber-500" : "text-zinc-300"}>
            ★
          </span>
        ),
      )}
    </span>
  );
}

export function MyReviewList({ initial }: { initial: MyReview[] }) {
  const [list, setList] = useState<MyReview[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");

  function startEdit(r: MyReview) {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditContent(r.content);
  }

  async function save(id: number) {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: editRating, content: editContent }),
    });
    const data = await res.json();
    if (res.ok) {
      setList((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, rating: data.review.rating, content: data.review.content } : r,
        ),
      );
      setEditingId(null);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("리뷰를 삭제할까요?")) return;
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) setList((prev) => prev.filter((r) => r.id !== id));
  }

  if (list.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
        <p className="text-zinc-500">아직 작성한 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((r) => (
        <div key={r.id} className="bg-white rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <Link href={`/restaurants/${r.restaurant_id}`} className="font-medium text-sm hover:text-teal-600">
              {r.restaurant_name}
            </Link>
            {editingId === r.id ? (
              <Stars n={editRating} onPick={setEditRating} />
            ) : (
              <Stars n={r.rating} />
            )}
          </div>

          {editingId === r.id ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex gap-2">
                <button onClick={() => save(r.id)} className="rounded-md bg-teal-600 text-white text-sm px-3 py-1.5 hover:bg-teal-700">
                  저장
                </button>
                <button onClick={() => setEditingId(null)} className="rounded-md border border-zinc-300 text-sm px-3 py-1.5 hover:bg-zinc-50">
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-700 mt-1 whitespace-pre-wrap">{r.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-zinc-400">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </p>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => startEdit(r)} className="text-zinc-500 hover:text-teal-600">
                    수정
                  </button>
                  <button onClick={() => remove(r.id)} className="text-zinc-500 hover:text-red-500">
                    삭제
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
