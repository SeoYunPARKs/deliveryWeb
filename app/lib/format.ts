// 금액(원) 한국어 표기 헬퍼
export function won(amount: number): string {
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

// 주문 상태 한글 라벨
export function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "접수 대기";
    case "received":
      return "접수";
    case "delivering":
      return "배달중";
    case "completed":
      return "완료";
    default:
      return status;
  }
}
