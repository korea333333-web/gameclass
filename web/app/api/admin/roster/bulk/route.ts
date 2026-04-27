// 어드민이 명단을 일괄 등록하는 라우트.
// 입력 텍스트를 줄 단위로 파싱: "학번 이름" 형식 (구분자: 공백/탭/콤마 모두 허용)
// 같은 학번이 이미 있으면 이름만 갱신(upsert).

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const STUDENT_ID_PATTERN = /^\d{7,10}$/;

type ParsedRow = { studentId: string; name: string };
type SkippedRow = { line: string; reason: string };

// 모든 종류의 공백/구분자(일반 공백, 탭, NBSP, 콤마, 다중 공백 등)를 관대하게 처리.
// 첫 토큰이 학번(7~8자리 숫자), 나머지 합쳐서 이름.
function parseLines(text: string): {
  rows: ParsedRow[];
  skipped: SkippedRow[];
} {
  const rows: ParsedRow[] = [];
  const skipped: SkippedRow[] = [];
  const seen = new Set<string>();

  for (const raw of text.split(/\r?\n/)) {
    // 일반 trim + NBSP / Zero-width space 제거
    const line = raw
      .replace(/ /g, " ")
      .replace(/[​-‍﻿]/g, "")
      .trim();
    if (!line) continue;

    // 한글 NFD → NFC 정규화 (Mac 클립보드 호환)
    const normalized = line.normalize("NFC");

    // 공백/탭/콤마/세미콜론으로 split
    const parts = normalized
      .split(/[\s,;\t]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length < 2) {
      skipped.push({ line: normalized, reason: "토큰 부족 (학번 + 이름 필요)" });
      continue;
    }

    const studentId = parts[0];
    if (!STUDENT_ID_PATTERN.test(studentId)) {
      skipped.push({
        line: normalized,
        reason: `학번 형식 오류: ${studentId}`,
      });
      continue;
    }

    // 이름은 나머지 토큰을 모두 이어붙임 (성과 이름 사이 공백 허용)
    const name = parts.slice(1).join("");
    if (name.length < 2 || name.length > 10) {
      skipped.push({
        line: normalized,
        reason: `이름 길이 오류: "${name}" (${name.length}자)`,
      });
      continue;
    }

    if (seen.has(studentId)) {
      skipped.push({
        line: normalized,
        reason: "같은 입력에서 중복 학번",
      });
      continue;
    }
    seen.add(studentId);
    rows.push({ studentId, name });
  }

  return { rows, skipped };
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "empty_text" }, { status: 400 });
  }

  const { rows, skipped } = parseLines(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "no_valid_rows", skipped },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("roster")
    .upsert(
      rows.map((r) => ({ student_id: r.studentId, name: r.name })),
      { onConflict: "student_id" },
    );

  if (error) {
    console.error("[admin/roster/bulk] upsert error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    added: rows.length,
    skipped,
  });
}
