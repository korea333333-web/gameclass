export const ALLOWED_EMAIL_DOMAIN = "kw.ac.kr";

export const EMAIL_DOMAIN_ERROR = "광운대 학교 이메일(@kw.ac.kr)만 가능합니다";

const SCHOOL_EMAIL_PATTERN = /^[^\s@]+@kw\.ac\.kr$/i;

export function isValidSchoolEmail(email: string): boolean {
  return SCHOOL_EMAIL_PATTERN.test(email.trim());
}
