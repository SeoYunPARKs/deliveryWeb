"use client";

import { useState } from "react";
import Link from "next/link";
import type { Review } from "@/app/lib/types";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => onChange(s)}
          className={s <= value ? "text-amber-500 text-xl" : "text-zinc-300 text-xl"}
          aria-label={`${s}점`}
        >
          ★
        </button>
      ))}
      <span className="text-sm text-zinc-500 ml-1">{value}점</span>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-500" aria-label={`${n}점`}>
      {"★".repeat(n)}
      <span className="text-zinc-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ReviewSection({
  restaurantId,
  initialReviews,
  canReview,
  currentUserId,
}: {
  restaurantId: number;
  initialReviews: Review[];
  canReview: boolean;
  currentUserId: number | null;
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 수정 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("리뷰 내용을 입력하세요.");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "리뷰 작성에 실패했습니다.");
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setContent("");
      setRating(5);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(rv: Review) {
    setEditingId(rv.id);
    setEditRating(rv.rating);
    setEditContent(rv.content);
  }

  async function saveEdit(reviewId: number) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: editRating, content: editContent }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? data.review : r)));
      setEditingId(null);
    }
  }

  async function remove(reviewId: number) {
    if (!window.confirm("리뷰를 삭제할까요?")) return;
    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  return (
    <div className="mt-8">
      <h2 className="font-bold mb-3">리뷰 ({reviews.length})</h2>

      {/* 작성 폼 / 안내 */}
      {canReview ? (
        <form onSubmit={submit} className="bg-white rounded-xl border border-zinc-200 p-4 mb-4 space-y-2">
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="맛은 어땠나요?"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-teal-600 text-white text-sm px-4 py-2 hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "리뷰 등록"}
          </button>
        </form>
      ) : currentUserId ? (
        <p className="text-sm text-zinc-500 mb-4 bg-white border border-zinc-200 rounded-lg p-3">
          이 식당에서 <b>주문한 내역이 있어야</b> 리뷰를 쓸 수 있어요.
        </p>
      ) : (
        <p className="text-sm text-zinc-500 mb-4">
          리뷰를 쓰려면{" "}
          <Link href="/login" className="text-teal-600 font-medium">로그인</Link>
          하세요.
        </p>
      )}

      {/* 목록 */}
      {reviews.length === 0 ? (
        <p className="text-center text-zinc-400 py-6">아직 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((rv) => (
            <div key={rv.id} className="bg-white rounded-lg border border-zinc-200 p-4">
              {editingId === rv.id ? (
                <div className="space-y-2">
                  <StarPicker value={editRating} onChange={setEditRating} />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(rv.id)} className="rounded-md bg-teal-600 text-white text-sm px-3 py-1.5 hover:bg-teal-700">
                      저장
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-md border border-zinc-300 text-sm px-3 py-1.5 hover:bg-zinc-50">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{rv.user_name}</span>
                    <Stars n={rv.rating} />
                  </div>
                  <p className="text-sm text-zinc-700 mt-1 whitespace-pre-wrap">{rv.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-400">
                      {new Date(rv.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    {rv.user_id === currentUserId && (
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => startEdit(rv)} className="text-zinc-500 hover:text-teal-600">
                          수정
                        </button>
                        <button onClick={() => remove(rv.id)} className="text-zinc-500 hover:text-red-500">
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
