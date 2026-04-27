// 학번+이름 매칭 → 비밀번호로 Supabase Auth 사용자 생성 → profiles 자동 등록
//
// 흐름:
//   1) 입력 검증 (학번/이름/학년/비밀번호 형식)
//   2) roster 매칭 확인 (Service Role로 직접 SELECT)
//   3) 학번 중복(이미 가입된 사용자) 확인
//   4) supabase.auth.admin.createUser({ email_confirm: true })
//   5) profiles INSERT (role: 'student', is_active: false)
//   6) 텔레그램으로 어드민에게 승인 요청 알림
//
// 클라이언트는 응답 200 받으면 signInWithPassword로 로그인 → /pending 으로 이동.

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendApprovalRequest } from "@/lib/telegram";
import {
  isValidStudentId,
  isValidName,
  studentIdToEmail,
  validatePassword,
  STUDENT_ID_INVALID_ERROR,
  NAME_INVALID_ERROR,
  NOT_IN_ROSTER_ERROR,
  ALREADY_REGISTERED_ERROR,
} from "@/lib/auth/student-id";

type Body = {
  studentId?: string;
  name?: string;
  grade?: number;
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const studentId = (body.studentId ?? "").trim();
  const name = (body.name ?? "").trim();
  const grade = Number(body.grade);
  const password = body.password ?? "";

  if (!isValidStudentId(studentId)) {
    return NextResponse.json(
      { error: STUDENT_ID_INVALID_ERROR },
      { status: 400 },
    );
  }
  if (!isValidName(name)) {
    return NextResponse.json({ error: NAME_INVALID_ERROR }, { status: 400 });
  }
  if (![1, 2, 3, 4].includes(grade)) {
    return NextResponse.json(
      { error: "학년은 1~4 사이여야 합니다" },
      { status: 400 },
    );
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1) roster 매칭 확인
  const { data: roster, error: rosterError } = await admin
    .from("roster")
    .select("student_id, name")
    .eq("student_id", studentId)
    .eq("name", name)
    .maybeSingle();

  if (rosterError) {
    console.error("[signup] roster lookup error", rosterError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!roster) {
    return NextResponse.json({ error: NOT_IN_ROSTER_ERROR }, { status: 403 });
  }

  // 2) 학번 중복 확인
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: ALREADY_REGISTERED_ERROR },
      { status: 409 },
    );
  }

  // 3) Supabase Auth 사용자 생성 (이메일 자동 확인)
  const email = studentIdToEmail(studentId);
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { student_id: studentId, name, grade },
    });

  if (createError || !created.user) {
    if (createError?.message?.toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: ALREADY_REGISTERED_ERROR },
        { status: 409 },
      );
    }
    console.error("[signup] createUser error", createError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // 4) profiles INSERT (is_active=false → 어드민 승인 필요)
  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    student_id: studentId,
    name,
    grade,
    role: "student",
    is_active: false,
  });

  if (profileError) {
    console.error("[signup] profile insert error", profileError);
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // 5) 텔레그램 승인 요청 알림 (실패해도 가입은 성공)
  try {
    await sendApprovalRequest({
      userId: created.user.id,
      studentId,
      name,
      grade,
    });
  } catch (e) {
    console.error("[signup] telegram notify error", e);
  }

  return NextResponse.json({ ok: true, studentId });
}
