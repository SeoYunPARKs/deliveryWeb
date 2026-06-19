import Link from "next/link";

const FAQ = [
  { q: "주문은 어떻게 하나요?", a: "동네를 선택하고 식당·메뉴를 골라 장바구니에 담은 뒤 주문하기를 누르면 됩니다." },
  { q: "리뷰는 누구나 쓸 수 있나요?", a: "해당 식당에서 주문한 내역이 있는 회원만 작성할 수 있어요." },
  { q: "포인트는 어떻게 적립되나요?", a: "주문 결제 금액의 1%가 자동으로 적립됩니다." },
  { q: "사장님인데 가게는 어디서 등록하나요?", a: "사장님 계정으로 로그인 후 [마이페이지 → 내 가게 관리]에서 등록할 수 있어요." },
];

export default function SupportPage() {
  return (
    <div>
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">💬 고객센터</h1>

      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-3">
        <p className="font-semibold mb-2">자주 묻는 질문</p>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-zinc-800">Q. {f.q}</p>
              <p className="text-sm text-zinc-500 mt-0.5">A. {f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600 space-y-1">
        <p className="font-semibold text-zinc-800 mb-1">문의</p>
        <p>📞 1588-0000 (평일 09:00~18:00)</p>
        <p>✉️ help@matna.example.com</p>
      </div>
    </div>
  );
}
