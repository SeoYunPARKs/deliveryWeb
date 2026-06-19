import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const user = await getSessionUser();
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

  const me = (
    await query<{ points: number; name: string }>(
      "SELECT points, name FROM users WHERE id = $1",
      [user.id],
    )
  )[0] ?? { points: 0, name: user.name };

  const counts = (
    await query<{ orders: number; favorites: number; reviews: number }>(
      `SELECT
         (SELECT COUNT(*) FROM orders     WHERE user_id = $1)::int AS orders,
         (SELECT COUNT(*) FROM favorites  WHERE user_id = $1)::int AS favorites,
         (SELECT COUNT(*) FROM reviews    WHERE user_id = $1)::int AS reviews`,
      [user.id],
    )
  )[0];

  const menu = [
    { href: "/orders", icon: "🧾", label: "주문내역", badge: counts.orders },
    { href: "/mypage/favorites", icon: "❤️", label: "찜한 가게", badge: counts.favorites },
    { href: "/mypage/reviews", icon: "✍️", label: "내가 쓴 리뷰", badge: counts.reviews },
    { href: "/mypage/addresses", icon: "📍", label: "주소 관리" },
    { href: "/mypage/coupons", icon: "🎟️", label: "쿠폰함" },
    { href: "/mypage/gifts", icon: "🎁", label: "선물함" },
    { href: "/mypage/payments", icon: "💳", label: "결제 수단" },
    { href: "/mypage/support", icon: "💬", label: "고객센터" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">마이페이지</h1>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">
              {me.name}님{" "}
              <span className="text-xs align-middle rounded-full bg-zinc-100 text-zinc-500 px-2 py-0.5">
                {user.role === "owner" ? "사장님" : "손님"}
              </span>
            </p>
            <p className="text-sm text-zinc-400 mt-0.5">{user.email}</p>
          </div>
          <Link
            href="/mypage/profile"
            className="text-sm rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
          >
            프로필 수정
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-teal-50 px-4 py-3">
          <span className="text-sm text-teal-800">보유 포인트</span>
          <span className="font-bold text-teal-700">{me.points.toLocaleString("ko-KR")}P</span>
        </div>
      </div>

      {/* 사장님 전용 */}
      {user.role === "owner" && (
        <Link
          href="/owner"
          className="mt-3 block bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition text-sm font-medium"
        >
          🏪 내 가게 관리 →
        </Link>
      )}

      {/* 메뉴 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {menu.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="relative bg-white rounded-xl border border-zinc-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition"
          >
            <span className="text-2xl">{m.icon}</span>
            <span className="text-sm text-zinc-700">{m.label}</span>
            {typeof m.badge === "number" && m.badge > 0 && (
              <span className="absolute top-2 right-2 text-[10px] bg-teal-600 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {m.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
