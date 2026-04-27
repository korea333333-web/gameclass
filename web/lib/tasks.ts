// 과제 To-do 관련 공용 헬퍼.

export type TaskLabel = "personal" | "team" | "exam" | "presentation" | "quiz";

export const TASK_LABELS: { value: TaskLabel; label: string; color: string }[] = [
  { value: "personal", label: "개인 과제", color: "var(--color-ink-2)" },
  { value: "team", label: "팀 과제", color: "#6E7A4E" },
  { value: "exam", label: "시험", color: "#B5483A" },
  { value: "presentation", label: "발표", color: "#5C6F7C" },
  { value: "quiz", label: "퀴즈", color: "#A66E5C" },
];

export function labelOf(value: TaskLabel): string {
  return TASK_LABELS.find((t) => t.value === value)?.label ?? "개인 과제";
}

export function colorOf(value: TaskLabel): string {
  return (
    TASK_LABELS.find((t) => t.value === value)?.color ?? "var(--color-ink-2)"
  );
}

export type Task = {
  id: string;
  title: string;
  due_at: string; // ISO timestamp
  schedule_entry_id: string | null;
  subject_label: string | null;
  label: TaskLabel;
  memo: string | null;
  completed_at: string | null;
};

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.completed_at) return false;
  return new Date(task.due_at).getTime() < now.getTime();
}

export function formatDueIn(
  dueAt: string,
  now: Date = new Date(),
): string {
  const due = new Date(dueAt).getTime();
  const diffMs = due - now.getTime();
  const past = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const min = Math.floor(absMs / 60000);
  const hours = Math.floor(min / 60);
  const days = Math.floor(hours / 24);

  if (past) {
    if (days > 0) return `${days}일 지남`;
    if (hours > 0) return `${hours}시간 지남`;
    return `${min}분 지남`;
  }
  if (days > 0) return `D-${days}`;
  if (hours > 0) return `${hours}시간 남음`;
  return `${Math.max(0, min)}분 남음`;
}

export function formatKoreanDateTime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// datetime-local input value (YYYY-MM-DDTHH:MM) → ISO
export function localInputToIso(local: string): string | null {
  if (!local) return null;
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const d = new Date(local);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ISO → datetime-local input value
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
