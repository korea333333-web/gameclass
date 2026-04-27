// 어드민이 명단에서 한 학번을 제거.
// 이미 가입한 학생이라면 auth.users / profiles는 그대로 두고 roster에서만 제거 (보존적 동작).
// 완전 삭제가 필요하면 별도 엔드포인트로 분리할 것.

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  await requireAdmin();

  let body: { studentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const studentId = (body.studentId ?? "").trim();
  if (!/^\d{7,8}$/.test(studentId)) {
    return NextResponse.json({ error: "invalid_student_id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("roster")
    .delete()
    .eq("student_id", studentId);

  if (error) {
    console.error("[admin/roster/delete] error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
