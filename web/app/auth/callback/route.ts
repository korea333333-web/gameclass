import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidSchoolEmail } from "@/lib/auth/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_code`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed`,
    );
  }

  // 이중 검증: 학교 이메일이 아닌 사용자가 어떤 경로로든 들어오면 차단
  const email = data.user.email ?? "";
  if (!isValidSchoolEmail(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=invalid_domain`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
