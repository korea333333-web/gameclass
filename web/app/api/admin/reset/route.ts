// 어드민이 학생 비밀번호를 임시 비번으로 리셋.
// profiles → user_id 조회 → admin API로 비밀번호 갱신.

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isValidStudentId,
  validatePassword,
} from "@/lib/auth/student-id";

export async function POST(request: NextRequest) {
  await requireAdmin();

  let body: { studentId?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const studentId = (body.studentId ?? "").trim();
  const newPassword = body.newPassword ?? "";

  if (!isValidStudentId(studentId)) {
    return NextResponse.json(
      { error: "학번은 7~8자리 숫자여야 합니다" },
      { status: 400 },
    );
  }
  const pwError = validatePassword(newPassword);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile, error: lookupError } = await admin
    .from("profiles")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();

  if (lookupError) {
    console.error("[admin/reset] lookup error", lookupError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json(
      { error: "해당 학번으로 가입된 학생이 없습니다" },
      { status: 404 },
    );
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    profile.id as string,
    { password: newPassword },
  );

  if (updateError) {
    console.error("[admin/reset] update error", updateError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
