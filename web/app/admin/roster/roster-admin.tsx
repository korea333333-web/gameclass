"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

type Row = {
  student_id: string;
  name: string;
  created_at: string;
  registered: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

export function RosterAdmin({ initialRows }: { initialRows: Row[] }) {
  const router = useRouter();
  const [bulkText, setBulkText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [filter, setFilter] = useState("");

  const filteredRows = useMemo(() => {
    const q = filter.trim();
    if (!q) return initialRows;
    return initialRows.filter(
      (r) => r.student_id.includes(q) || r.name.includes(q),
    );
  }, [initialRows, filter]);

  async function onBulkSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bulkText.trim()) {
      setStatus({ kind: "error", message: "명단을 입력해 주세요" });
      return;
    }

    setStatus({ kind: "loading" });
    const res = await fetch("/api/admin/roster/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: bulkText }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      added?: number;
      skipped?: { line: string; reason: string }[];
      error?: string;
    };

    if (!res.ok) {
      const skipped = json.skipped ?? [];
      const msg =
        json.error === "no_valid_rows"
          ? `유효한 줄이 없습니다 (제외 ${skipped.length}줄)`
          : json.error || "등록에 실패했습니다";
      setStatus({ kind: "error", message: msg });
      return;
    }

    const skippedCount = json.skipped?.length ?? 0;
    setStatus({
      kind: "ok",
      message: `${json.added}명 등록${skippedCount > 0 ? ` · 형식 오류 ${skippedCount}줄 제외` : ""}`,
    });
    setBulkText("");
    router.refresh();
  }

  async function onDelete(studentId: string) {
    if (!confirm(`${studentId} 학번을 명단에서 삭제하시겠습니까?`)) return;
    const res = await fetch("/api/admin/roster/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) {
      alert("삭제에 실패했습니다");
      return;
    }
    router.refresh();
  }

  return (
    <>
      <section className="dt-card mb-8">
        <p className="dt-caps mb-2">일괄 등록</p>
        <p className="dt-secondary mb-4">
          한 줄에 한 명씩, &quot;학번 이름&quot; 형식으로 붙여넣어 주세요. 같은 학번은
          이름만 갱신됩니다.
        </p>

        <form onSubmit={onBulkSubmit}>
          <textarea
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              if (status.kind !== "loading") setStatus({ kind: "idle" });
            }}
            disabled={status.kind === "loading"}
            placeholder={
              "2026038001 최정운\n2026038002 이상준\n2026038005 유비"
            }
            rows={8}
            className="dt-input w-full"
            style={{ fontFamily: "var(--font-mono)" }}
          />

          {status.kind === "error" && (
            <p
              className="dt-secondary mt-3"
              style={{ color: "var(--color-status-miss)" }}
              role="alert"
            >
              {status.message}
            </p>
          )}
          {status.kind === "ok" && (
            <p className="dt-secondary mt-3" role="status">
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={status.kind === "loading"}
            className="dt-btn-card mt-4"
          >
            {status.kind === "loading" ? "등록 중..." : "일괄 등록"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="dt-caps">명단 목록</p>
          <input
            type="search"
            placeholder="학번/이름 검색"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="dt-input"
            style={{ maxWidth: 220 }}
          />
        </div>

        {filteredRows.length === 0 ? (
          <div className="dt-card text-center">
            <p className="dt-secondary">
              {initialRows.length === 0
                ? "아직 등록된 명단이 없습니다"
                : "검색 결과가 없습니다"}
            </p>
          </div>
        ) : (
          <ul className="dt-card space-y-2 p-0">
            {filteredRows.map((r) => (
              <li
                key={r.student_id}
                className="flex items-center justify-between border-b py-3"
                style={{ borderColor: "var(--hairline)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="dt-mono"
                    style={{ color: "var(--color-ink-2)", minWidth: 88 }}
                  >
                    {r.student_id}
                  </span>
                  <span className="dt-task">{r.name}</span>
                  {r.registered && (
                    <span className="dt-caps" style={{ color: "var(--color-ink-3)" }}>
                      가입완료
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(r.student_id)}
                  className="dt-btn-text"
                  aria-label={`${r.student_id} 삭제`}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
