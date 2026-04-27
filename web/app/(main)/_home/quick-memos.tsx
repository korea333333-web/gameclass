"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type QuickMemo = {
  id: string;
  content: string;
  completed_at: string | null;
};

export function QuickMemos({
  initialMemos,
}: {
  initialMemos: QuickMemo[];
}) {
  const [memos, setMemos] = useState<QuickMemo[]>(initialMemos);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // 정렬: 미완료가 위, 그 안에선 최신순
  const sorted = [...memos].sort((a, b) => {
    if (!!a.completed_at !== !!b.completed_at) return a.completed_at ? 1 : -1;
    return b.id.localeCompare(a.id);
  });

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    const { data, error } = await supabase
      .from("quick_memos")
      .insert({ user_id: user.id, content })
      .select("id, content, completed_at")
      .single();
    setSubmitting(false);
    if (error || !data) {
      alert("메모 추가 실패: " + (error?.message ?? ""));
      return;
    }
    setMemos((prev) => [data as QuickMemo, ...prev]);
    setInput("");
  }

  async function onToggle(memo: QuickMemo) {
    const next = memo.completed_at ? null : new Date().toISOString();
    // 즉시 UI 업데이트 (낙관적)
    setMemos((prev) =>
      prev.map((m) => (m.id === memo.id ? { ...m, completed_at: next } : m)),
    );
    const { error } = await supabase
      .from("quick_memos")
      .update({ completed_at: next })
      .eq("id", memo.id);
    if (error) {
      // 롤백
      setMemos((prev) =>
        prev.map((m) =>
          m.id === memo.id ? { ...m, completed_at: memo.completed_at } : m,
        ),
      );
      alert("저장 실패: " + error.message);
    }
  }

  async function onDelete(id: string) {
    const prev = memos;
    setMemos((p) => p.filter((m) => m.id !== id));
    const { error } = await supabase.from("quick_memos").delete().eq("id", id);
    if (error) {
      setMemos(prev);
      alert("삭제 실패: " + error.message);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      // form onSubmit이 처리
    }
  }

  const pendingCount = memos.filter((m) => !m.completed_at).length;

  return (
    <section className="dt-card mb-4" aria-labelledby="quick-memos-heading">
      <div
        className="mb-3"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
      >
        <p id="quick-memos-heading" className="dt-caps">
          빠른 메모
        </p>
        <span
          className="dt-meta"
          style={{ color: "var(--color-ink-3)" }}
        >
          {pendingCount}건
        </span>
      </div>

      <form onSubmit={onAdd} className="mb-3" style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 200))}
          onKeyDown={onKey}
          placeholder="할 일 한 줄 입력 후 Enter"
          className="dt-input"
          style={{ flex: 1 }}
          disabled={submitting}
          maxLength={200}
        />
        <button
          type="submit"
          className="dt-btn-card"
          disabled={submitting || !input.trim()}
          style={{ padding: "0 16px" }}
        >
          추가
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="dt-meta" style={{ color: "var(--color-ink-3)" }}>
          입력한 메모가 여기 쌓입니다
        </p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sorted.map((m) => {
            const completed = !!m.completed_at;
            return (
              <li
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 4px",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() => onToggle(m)}
                  aria-label={`${m.content} 완료 표시`}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "var(--color-ink-2)",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    color: completed
                      ? "var(--color-ink-3)"
                      : "var(--color-ink-1)",
                    textDecoration: completed ? "line-through" : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 14,
                  }}
                >
                  {m.content}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(m.id)}
                  className="dt-btn-text"
                  aria-label={`${m.content} 삭제`}
                  style={{
                    fontSize: 12,
                    color: "var(--color-ink-3)",
                    padding: "2px 6px",
                    flexShrink: 0,
                  }}
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
