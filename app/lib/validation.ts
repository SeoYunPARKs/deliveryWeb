// 클라이언트·서버 양쪽에서 쓰는 입력 검증 헬퍼.
// 통과하면 null, 실패하면 사용자에게 보여줄 에러 메시지를 반환한다.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

export function validateEmail(email: string): string | null {
  if (!email) return "이메일을 입력하세요.";
  if (!EMAIL_RE.test(email)) return "올바른 이메일 형식이 아닙니다.";
  return null;
}

// 8자 이상 + 영문 대문자 + 영문 소문자 + 특수문자
export function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (!/[a-z]/.test(pw)) return "비밀번호에 영문 소문자를 포함하세요.";
  if (!/[A-Z]/.test(pw)) return "비밀번호에 영문 대문자를 포함하세요.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "비밀번호에 특수문자(!@#$ 등)를 포함하세요.";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return "연락처를 입력하세요.";
  if (!PHONE_RE.test(phone.replace(/\s/g, "")))
    return "올바른 연락처 형식이 아닙니다. (예: 010-1234-5678)";
  return null;
}
