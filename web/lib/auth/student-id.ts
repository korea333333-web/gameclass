// 학번 + 비밀번호 인증 관련 공용 헬퍼
//
// Supabase Auth는 email + password 방식이므로,
// 학번을 가짜 도메인으로 매핑해서 사용한다.
//   2026038001 → 2026038001@gameclass.local
// 이 도메인은 실제 메일 발송 대상이 아니라 내부 식별자 용도다.

export const FAKE_EMAIL_DOMAIN = "gameclass.local";

const STUDENT_ID_PATTERN = /^\d{7,10}$/;

export const STUDENT_ID_INVALID_ERROR = "학번은 7~10자리 숫자여야 합니다";
export const NAME_INVALID_ERROR = "이름은 2~10자 사이여야 합니다";
export const PASSWORD_LENGTH_ERROR = "비밀번호는 8자 이상이어야 합니다";
export const PASSWORD_LETTER_ERROR = "비밀번호에 영문자를 1개 이상 포함해야 합니다";
export const PASSWORD_DIGIT_ERROR = "비밀번호에 숫자를 1개 이상 포함해야 합니다";
export const PASSWORD_MISMATCH_ERROR = "비밀번호가 일치하지 않습니다";
export const NOT_IN_ROSTER_ERROR = "등록되지 않은 학생입니다. 학번/이름을 확인해 주세요";
export const ALREADY_REGISTERED_ERROR = "이미 가입된 학번입니다. 로그인 화면으로 이동해 주세요";
export const SIGNIN_FAILED_ERROR = "학번 또는 비밀번호가 일치하지 않습니다";

export function isValidStudentId(s: string): boolean {
  return STUDENT_ID_PATTERN.test(s.trim());
}

export function isValidName(s: string): boolean {
  const len = s.trim().length;
  return len >= 2 && len <= 10;
}

export function studentIdToEmail(studentId: string): string {
  return `${studentId.trim()}@${FAKE_EMAIL_DOMAIN}`;
}

export function emailToStudentId(email: string): string | null {
  const m = email.match(/^(\d{7,10})@gameclass\.local$/i);
  return m ? m[1] : null;
}

export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return PASSWORD_LENGTH_ERROR;
  if (!/[a-zA-Z]/.test(pw)) return PASSWORD_LETTER_ERROR;
  if (!/[0-9]/.test(pw)) return PASSWORD_DIGIT_ERROR;
  return null;
}

export function sanitizeStudentId(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

export function sanitizeName(raw: string): string {
  return raw.slice(0, 10);
}
