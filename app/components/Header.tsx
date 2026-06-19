"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { useCart } from "@/app/components/CartProvider";

export function Header() {
  const { user, loading, setUser } = useAuth();
  const { itemCount, hydrated, clearCart } = useCart();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    clearCart(); // 로그아웃 시 장바구니 비우기
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-zinc-200">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="font-extrabold text-base sm:text-lg text-teal-600 shrink-0 whitespace-nowrap"
        >
          🛵 맛나배달
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-3 text-xs sm:text-sm">
          <Link
            href="/cart"
            className="relative text-zinc-600 hover:text-zinc-900 px-1.5 sm:px-2 py-1 whitespace-nowrap"
          >
            장바구니
            {hydrated && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/orders"
            className="text-zinc-600 hover:text-zinc-900 px-1.5 sm:px-2 py-1 whitespace-nowrap"
          >
            주문내역
          </Link>
          {loading ? null : user ? (
            <>
              {user.role === "owner" && (
                <Link
                  href="/owner"
                  className="text-zinc-600 hover:text-zinc-900 px-1.5 sm:px-2 py-1 whitespace-nowrap"
                >
                  사장님
                </Link>
              )}
              <Link
                href="/mypage"
                className="text-zinc-700 font-medium hover:text-teal-600 px-1 whitespace-nowrap max-w-[4.5rem] sm:max-w-none truncate"
              >
                {user.name}님
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md bg-zinc-100 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-zinc-200 whitespace-nowrap shrink-0"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md bg-teal-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-teal-700 whitespace-nowrap shrink-0"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-zinc-600 hover:text-zinc-900 px-1.5 sm:px-2 py-1 whitespace-nowrap"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
