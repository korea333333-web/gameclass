"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type StudentRow = {
  id: string;
  student_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export function StudentsAdmin({ initialRows }: { initialRows: StudentRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<StudentRow[]>(initialRows);
  const [filter, setFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filter.trim();
    if (!q) return rows;
    return rows.filter(
      (r) => r.student_id.includes(q) || r.name.includes(q),
    );
  }, [rows, filter]);

  async function onDelete(row: StudentRow) {
    const ok = confirm(
      `${row.student_id} ${row.name} 학생을 삭제하시겠습니까?\n\n` +
        `· auth.users + profiles 모두 삭제됩니다 (되돌릴 수 없음)\n` +
        `· 명단(roster)은 그대로 유지되어 같은 학번으로 재가입 가능합니다`,
    );
    if (!ok) return;

    setDeletingId(row.id);
    const res = await fetch("/api/admin/students/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: row.id }),
    });
    setDeletingId(null);

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      alert("삭제 실패: " + (json.error ?? "알 수 없는 오류"));
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== row.id));
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="dt-caps">학생 목록</p>
        <input
          type="search"
          placeholder="학번/이름 검색"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="dt-input"
          style={{ maxWidth: 220 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="dt-card text-center">
          <p className="dt-secondary">
            {rows.length === 0
              ? "아직 가입한 학생이 없습니다"
              : "검색 결과가 없습니다"}
          </p>
        </div>
      ) : (
        <ul className="dt-card space-y-0 p-0">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between border-b py-3"
              style={{ borderColor: "var(--hairline)", padding: "12px 0" }}
            >
              <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                <span
                  className="dt-mono"
                  style={{ color: "var(--color-ink-2)", minWidth: 100 }}
                >
                  {r.student_id}
                </span>
                <span className="dt-task">{r.name}</span>
                <span
                  className="dt-caps"
                  style={{
                    color: r.is_active
                      ? "var(--color-ink-3)"
                      : "var(--color-status-miss)",
                    fontSize: 11,
                  }}
                >
                  {r.is_active ? "승인됨" : "대기 중"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onDelete(r)}
                className="dt-btn-text"
                disabled={deletingId === r.id}
                style={{
                  color: "var(--color-status-miss)",
                  fontSize: 13,
                }}
                aria-label={`${r.student_id} 삭제`}
              >
                {deletingId === r.id ? "삭제 중..." : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="dt-meta mt-6" style={{ color: "var(--color-ink-3)" }}>
        ⚠ 삭제 시 그 학생의 시간표/과제/메모도 모두 함께 삭제됩니다 (cascade).
      </p>
    </>
  );
}
