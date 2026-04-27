// 매직링크 인증을 더 이상 사용하지 않습니다 (2026-04-27 학번+비번 인증으로 전환).
// 혹시 남아있는 링크로 들어오면 로그인 화면으로 보냅니다.

import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
