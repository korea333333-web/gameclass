"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { type ColorKey } from "@/lib/schedule";
import {
  TASK_LABELS,
  colorOf,
  formatDueIn,
  isOverdue,
  isoToLocalInput,
  labelOf,
  localInputToIso,
  type Task,
  type TaskLabel,
} from "@/lib/tasks";

type Subject = { id: string; name: string; color: ColorKey };

type ModalState =
  | { kind: "closed" }
  | { kind: "new" }
  | { kind: "edit"; task: Task };

export function TasksClient({
  initialTasks,
  subjects,
}: {
  initialTasks: Task[];
  subjects: Subject[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [now, setNow] = useState(() => new Date());
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const pending = tasks
    .filter((t) => !t.completed_at)
    .sort(
      (a, b) =>
        new Date(a.due_at).getTime() - new Date(b.due_at).getTime(),
    );
  const done = tasks
    .filter((t) => t.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime(),
    );

  async function toggleComplete(task: Task) {
    const next = task.completed_at ? null : new Date().toISOString();
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed_at: next })
      .eq("id", task.id)
      .select(
        "id, title, due_at, schedule_entry_id, subject_label, label, memo, completed_at",
      )
      .single();
    if (error || !data) {
      alert("저장 실패: " + (error?.message ?? "알 수 없는 오류"));
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? (data as Task) : t)));
  }

  async function onSave(input: TaskFormPayload) {
    const supabasePayload = {
      title: input.title,
      due_at: input.due_at,
      schedule_entry_id: input.schedule_entry_id,
      subject_label: input.subject_label,
      label: input.label,
      memo: input.memo,
    };

    if (input.id) {
      const { data, error } = await supabase
        .from("tasks")
        .update(supabasePayload)
        .eq("id", input.id)
        .select(
          "id, title, due_at, schedule_entry_id, subject_label, label, memo, completed_at",
        )
        .single();
      if (error || !data) {
        alert("저장 실패: " + (error?.message ?? "알 수 없는 오류"));
        return;
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === input.id ? (data as Task) : t)),
      );
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...supabasePayload, user_id: user.id })
        .select(
          "id, title, due_at, schedule_entry_id, subject_label, label, memo, completed_at",
        )
        .single();
      if (error || !data) {
        alert("저장 실패: " + (error?.message ?? "알 수 없는 오류"));
        return;
      }
      setTasks((prev) => [...prev, data as Task]);
    }
    setModal({ kind: "closed" });
  }

  async function onDelete(id: string) {
    if (!confirm("이 과제를 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setModal({ kind: "closed" });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModal({ kind: "new" })}
        className="dt-btn-card w-full mb-6"
      >
        + 과제 추가
      </button>

      {pending.length === 0 && done.length === 0 ? (
        <div className="dt-card text-center">
          <p className="dt-secondary">아직 등록된 과제가 없습니다</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <p className="dt-caps mb-3">진행 중 ({pending.length})</p>
              <ul className="space-y-2">
                {pending.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    now={now}
                    onClick={() => setModal({ kind: "edit", task: t })}
                    onToggle={() => toggleComplete(t)}
                  />
                ))}
              </ul>
            </section>
          )}
          {done.length > 0 && (
            <section className="mb-4">
              <p className="dt-caps mb-3">완료 ({done.length})</p>
              <ul className="space-y-2">
                {done.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    now={now}
                    onClick={() => setModal({ kind: "edit", task: t })}
                    onToggle={() => toggleComplete(t)}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {modal.kind !== "closed" && (
        <TaskForm
          mode={modal.kind}
          initial={modal.kind === "edit" ? modal.task : null}
          subjects={subjects}
          onClose={() => setModal({ kind: "closed" })}
          onSave={onSave}
          onDelete={modal.kind === "edit" ? () => onDelete(modal.task.id) : undefined}
        />
      )}
    </>
  );
}

function TaskRow({
  task,
  now,
  onClick,
  onToggle,
}: {
  task: Task;
  now: Date;
  onClick: () => void;
  onToggle: () => void;
}) {
  const overdue = isOverdue(task, now);
  const completed = !!task.completed_at;

  return (
    <li
      className="dt-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        opacity: completed ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        aria-label={`${task.title} 완료 표시`}
        style={{ width: 20, height: 20, accentColor: "var(--color-ink-2)" }}
      />
      <button
        type="button"
        onClick={onClick}
        style={{
          flex: 1,
          textAlign: "left",
          background: "transparent",
          padding: 0,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "baseline",
            marginBottom: 2,
          }}
        >
          {task.subject_label && (
            <span
              className="dt-meta"
              style={{ color: "var(--color-ink-3)" }}
            >
              ({task.subject_label})
            </span>
          )}
          <span
            style={{
              fontWeight: 500,
              color: "var(--color-ink-1)",
              textDecoration: completed ? "line-through" : "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </span>
        </div>
        <div className="flex gap-3" style={{ alignItems: "center" }}>
          <span className="dt-meta" style={{ color: colorOf(task.label) }}>
            {labelOf(task.label)}
          </span>
          {!completed && (
            <span
              className="dt-meta"
              style={{
                color: overdue
                  ? "var(--color-status-miss)"
                  : "var(--color-ink-2)",
              }}
            >
              {formatDueIn(task.due_at, now)}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Task form modal
// ────────────────────────────────────────────────────────────────────────

type TaskFormPayload = {
  id?: string;
  title: string;
  due_at: string;
  schedule_entry_id: string | null;
  subject_label: string | null;
  label: TaskLabel;
  memo: string | null;
};

function TaskForm({
  mode,
  initial,
  subjects,
  onClose,
  onSave,
  onDelete,
}: {
  mode: "new" | "edit";
  initial: Task | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (payload: TaskFormPayload) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueLocal, setDueLocal] = useState(
    initial ? isoToLocalInput(initial.due_at) : defaultDueLocal(),
  );
  const [scheduleEntryId, setScheduleEntryId] = useState<string>(
    initial?.schedule_entry_id ?? "",
  );
  const [customSubject, setCustomSubject] = useState(
    initial && !initial.schedule_entry_id ? (initial.subject_label ?? "") : "",
  );
  const [label, setLabel] = useState<TaskLabel>(initial?.label ?? "personal");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
      setError("제목은 1~100자여야 합니다");
      return;
    }
    const iso = localInputToIso(dueLocal);
    if (!iso) {
      setError("마감일/시간을 입력해 주세요");
      return;
    }

    let subjectLabel: string | null = null;
    let entryId: string | null = null;
    if (scheduleEntryId) {
      const found = subjects.find((s) => s.id === scheduleEntryId);
      if (found) {
        subjectLabel = found.name;
        entryId = found.id;
      }
    } else if (customSubject.trim()) {
      subjectLabel = customSubject.trim().slice(0, 30);
    }

    setSaving(true);
    await onSave({
      id: initial?.id,
      title: trimmedTitle,
      due_at: iso,
      schedule_entry_id: entryId,
      subject_label: subjectLabel,
      label,
      memo: memo.trim() || null,
    });
    setSaving(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61, 53, 48, 0.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dt-card"
        style={{
          width: "100%",
          maxWidth: 460,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--color-surface-4)",
        }}
      >
        <h2 className="dt-h1 mb-5" style={{ fontSize: 22 }}>
          {mode === "new" ? "과제 추가" : "과제 수정"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="t-title" className="dt-caps mb-2 block">
              제목
            </label>
            <input
              id="t-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="프로그래밍 과제 #1"
              autoFocus
              className="dt-input"
              required
            />
          </div>

          <div>
            <label htmlFor="t-due" className="dt-caps mb-2 block">
              마감일/시간
            </label>
            <input
              id="t-due"
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
              className="dt-input"
              required
            />
          </div>

          <div>
            <label htmlFor="t-subject" className="dt-caps mb-2 block">
              과목 (선택)
            </label>
            <select
              id="t-subject"
              value={scheduleEntryId}
              onChange={(e) => {
                setScheduleEntryId(e.target.value);
                if (e.target.value) setCustomSubject("");
              }}
              className="dt-input"
            >
              <option value="">선택 안 함</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {!scheduleEntryId && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value.slice(0, 30))}
                placeholder="(또는 직접 입력)"
                className="dt-input mt-2"
              />
            )}
          </div>

          <div>
            <span className="dt-caps mb-2 block">분류</span>
            <div className="flex gap-2 flex-wrap">
              {TASK_LABELS.map((l) => {
                const active = label === l.value;
                return (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLabel(l.value)}
                    aria-pressed={active}
                    className="dt-btn-card"
                    style={{
                      padding: "6px 12px",
                      background: active
                        ? "var(--color-surface-2)"
                        : "var(--color-surface-3)",
                      borderColor: active
                        ? "var(--color-ink-3)"
                        : "var(--hairline)",
                      color: l.color,
                      fontSize: 13,
                    }}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="t-memo" className="dt-caps mb-2 block">
              메모 (선택)
            </label>
            <textarea
              id="t-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 500))}
              rows={3}
              className="dt-input"
              placeholder="참고 자료 링크, 분량, 제출 방식 등"
            />
          </div>

          {error && (
            <p
              className="dt-secondary"
              style={{ color: "var(--color-status-miss)" }}
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="dt-btn-card flex-1"
              style={{ background: "var(--color-surface-3)" }}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              className="dt-btn-card flex-1"
              disabled={saving}
            >
              {saving ? "저장 중..." : mode === "new" ? "추가" : "저장"}
            </button>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="dt-btn-text mt-3 mx-auto block"
              style={{ color: "var(--color-status-miss)" }}
              disabled={saving}
            >
              과제 삭제
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function defaultDueLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(23, 59, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
