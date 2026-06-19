import Link from "next/link";

export default function CouponsPage() {
  const coupons = [
    { code: "WELCOME3000", desc: "신규가입 축하 3,000원 할인", expire: "2026-12-31" },
    { code: "FREEDELIVERY", desc: "배달비 무료 쿠폰", expire: "2026-12-31" },
  ];

  return (
    <div>
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">🎟️ 쿠폰함</h1>
      <p className="text-xs text-zinc-400 mb-4">샘플 쿠폰입니다 (실제 주문 적용은 준비 중).</p>
      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.code} className="bg-white rounded-xl border border-dashed border-teal-300 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-teal-700">{c.desc}</p>
              <p className="text-xs text-zinc-400 mt-0.5">코드 {c.code} · ~{c.expire}</p>
            </div>
            <span className="text-xs rounded-full bg-teal-50 text-teal-700 px-2 py-1">사용 가능</span>
          </div>
        ))}
      </div>
    </div>
  );
}
