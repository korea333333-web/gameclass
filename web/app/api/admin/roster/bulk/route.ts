// 어드민이 명단을 일괄 등록하는 라우트.
// 입력 텍스트를 줄 단위로 파싱: "학번 이름" 형식 (구분자: 공백/탭/콤마 모두 허용)
// 같은 학번이 이미 있으면 이름만 갱신(upsert).

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const LINE_PATTERN = /^\s*(\d{7,8})\s*[,\t\s]\s*([가-힣a-zA-Z]{2,10})\s*$/;

type ParsedRow = { studentId: string; name: string };
type SkippedRow = { line: string; reason: string };

function parseLines(text: string): {
  rows: ParsedRow[];
  skipped: SkippedRow[];
} {
  const rows: ParsedRow[] = [];
  const skipped: SkippedRow[] = [];
  const seen = new Set<string>();

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(LINE_PATTERN);
    if (!m) {
      skipped.push({ line, reason: "형식 오류 (학번 이름)" });
      continue;
    }
    const studentId = m[1];
    const name = m[2].trim();
    if (seen.has(studentId)) {
      skipped.push({ line, reason: "같은 입력에서 중복 학번" });
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
