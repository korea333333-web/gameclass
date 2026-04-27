// 어드민이 가입한 학생을 완전히 삭제 (auth.users + profiles cascade)
// roster 명단은 보존 (그 학번으로 재가입 가능)

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  await requireAdmin();

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const userId = (body.userId ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 어드민 본인은 삭제 못 하도록 보호
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role === "admin") {
    return NextResponse.json(
      { error: "어드민 계정은 이 화면에서 삭제할 수 없습니다" },
      { status: 403 },
    );
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[admin/students/delete] error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
