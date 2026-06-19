import Link from "next/link";

export default function GiftsPage() {
  return (
    <div>
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">🎁 선물함</h1>
      <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
        <p className="text-4xl mb-3">🎁</p>
        <p className="text-zinc-500">받은 선물이 없습니다.</p>
        <p className="text-xs text-zinc-400 mt-1">선물하기 기능은 준비 중입니다.</p>
      </div>
    </div>
  );
}
