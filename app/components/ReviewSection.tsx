"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import type { Review } from "@/app/lib/types";

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
}: {
  restaurantId: number;
  initialReviews: Review[];
}) {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="mt-8">
      <h2 className="font-bold mb-3">리뷰 ({reviews.length})</h2>

      {/* 작성 폼 */}
      {loading ? null : user ? (
        <form onSubmit={submit} className="bg-white rounded-xl border border-zinc-200 p-4 mb-4 space-y-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setRating(s)}
                className={s <= rating ? "text-amber-500 text-xl" : "text-zinc-300 text-xl"}
                aria-label={`${s}점`}
              >
                ★
              </button>
            ))}
            <span className="text-sm text-zinc-500 ml-1">{rating}점</span>
          </div>
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
      ) : (
        <p className="text-sm text-zinc-500 mb-4">
          리뷰를 쓰려면{" "}
          <Link href="/login" className="text-teal-600 font-medium">
            로그인
          </Link>
          하세요.
        </p>
      )}

      {/* 목록 */}
      {reviews.length === 0 ? (
        <p className="text-center text-zinc-400 py-6">아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((rv) => (
            <div key={rv.id} className="bg-white rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{rv.user_name}</span>
                <Stars n={rv.rating} />
              </div>
              <p className="text-sm text-zinc-700 mt-1 whitespace-pre-wrap">{rv.content}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(rv.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
