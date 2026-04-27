"use client";

import { useState, type FormEvent } from "react";
import {
  COLORS,
  COLOR_KEYS,
  DAY_LABELS,
  FIRST_DAY,
  PERIODS,
  findConflict,
  minutesToHHMM,
  minuteToPeriodIndex,
  periodEndMinute,
  periodStartMinute,
  type ColorKey,
  type ScheduleEntry,
} from "@/lib/schedule";

type Initial = {
  id?: string;
  name?: string;
  day_of_week?: number;
  start_minute?: number;
  end_minute?: number;
  location?: string | null;
  professor?: string | null;
  color?: ColorKey;
};

export function EntryForm({
  mode,
  initial,
  existingEntries,
  onClose,
  onSave,
  onDelete,
}: {
  mode: "new" | "edit";
  initial: Initial;
  existingEntries: ScheduleEntry[];
  onClose: () => void;
  onSave: (
    input: Omit<ScheduleEntry, "id"> & { id?: string },
  ) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [name, setName] = useState(initial.name ?? "");
  const [day, setDay] = useState<number>(initial.day_of_week ?? FIRST_DAY);
  const [startPeriod, setStartPeriod] = useState<number>(
    initial.start_minute !== undefined
      ? minuteToPeriodIndex(initial.start_minute)
      : 1,
  );
  const [endPeriod, setEndPeriod] = useState<number>(
    initial.end_minute !== undefined
      ? // end_minute은 50분 후 시점이므로 -1분으로 보정해서 마지막 교시 인덱스
        minuteToPeriodIndex(initial.end_minute - 1)
      : 1,
  );
  const [location, setLocation] = useState(initial.location ?? "");
  const [professor, setProfessor] = useState(initial.professor ?? "");
  const [color, setColor] = useState<ColorKey>(initial.color ?? "mustard");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): {
    ok: boolean;
    payload?: Omit<ScheduleEntry, "id"> & { id?: string };
  } {
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 30) {
      setError("과목명은 1~30자여야 합니다");
      return { ok: false };
    }
    if (endPeriod < startPeriod) {
      setError("종료 교시는 시작 교시 이상이어야 합니다");
      return { ok: false };
    }

    const startM = periodStartMinute(startPeriod);
    const endM = periodEndMinute(endPeriod);

    const conflict = findConflict(existingEntries, day, startM, endM, initial.id);
    if (conflict) {
      setWarning(
        `이 시간에 이미 "${conflict.name}" 수업이 있습니다 (저장은 가능)`,
      );
    } else {
      setWarning(null);
    }

    setError(null);
    return {
      ok: true,
      payload: {
        id: initial.id,
        name: trimmedName,
        day_of_week: day,
        start_minute: startM,
        end_minute: endM,
        location: location.trim() || null,
        professor: professor.trim() || null,
        color,
      },
    };
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validate();
    if (!v.ok || !v.payload) return;
    setSaving(true);
    await onSave(v.payload);
    setSaving(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-form-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61, 53, 48, 0.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dt-card"
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--color-surface-4)",
        }}
      >
        <header className="mb-5">
          <h2 id="entry-form-title" className="dt-h1" style={{ fontSize: 22 }}>
            {mode === "new" ? "과목 추가" : "과목 수정"}
          </h2>
        </header>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="ef-name" className="dt-caps mb-2 block">
              과목명
            </label>
            <input
              id="ef-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="게임사운드기초"
              autoFocus
              className="dt-input"
              required
            />
          </div>

          <div>
            <span className="dt-caps mb-2 block">요일</span>
            <div className="flex gap-2">
              {DAY_LABELS.map((d, idx) => {
                const value = idx + FIRST_DAY;
                const active = day === value;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDay(value)}
                    className="dt-btn-card flex-1"
                    style={{
                      background: active
                        ? "var(--color-surface-2)"
                        : "var(--color-surface-3)",
                      borderColor: active
                        ? "var(--color-ink-3)"
                        : "var(--hairline)",
                      color: "var(--color-ink-1)",
                      padding: "8px 0",
                    }}
                    aria-pressed={active}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="ef-start" className="dt-caps mb-2 block">
                시작 교시
              </label>
              <select
                id="ef-start"
                value={String(startPeriod)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setStartPeriod(v);
                  if (endPeriod < v) setEndPeriod(v);
                }}
                className="dt-input"
              >
                {PERIODS.map((p) => (
                  <option key={p.index} value={String(p.index)}>
                    {p.label} ({p.startLabel})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="ef-end" className="dt-caps mb-2 block">
                종료 교시
              </label>
              <select
                id="ef-end"
                value={String(endPeriod)}
                onChange={(e) => setEndPeriod(Number(e.target.value))}
                className="dt-input"
              >
                {PERIODS.filter((p) => p.index >= startPeriod).map((p) => (
                  <option key={p.index} value={String(p.index)}>
                    {p.label} ({p.endLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="dt-meta" style={{ color: "var(--color-ink-3)" }}>
            {minutesToHHMM(periodStartMinute(startPeriod))} ~{" "}
            {minutesToHHMM(periodEndMinute(endPeriod))}
          </p>

          <div>
            <label htmlFor="ef-location" className="dt-caps mb-2 block">
              강의실 (선택)
            </label>
            <input
              id="ef-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 30))}
              placeholder="K-201"
              className="dt-input"
            />
          </div>

          <div>
            <label htmlFor="ef-prof" className="dt-caps mb-2 block">
              교수 (선택)
            </label>
            <input
              id="ef-prof"
              type="text"
              value={professor}
              onChange={(e) => setProfessor(e.target.value.slice(0, 20))}
              placeholder="김승욱"
              className="dt-input"
            />
          </div>

          <div>
            <span className="dt-caps mb-2 block">색상</span>
            <div className="flex gap-2 flex-wrap">
              {COLOR_KEYS.map((key) => {
                const c = COLORS[key];
                const active = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    aria-label={c.label}
                    aria-pressed={active}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: c.bg,
                      borderLeft: `3px solid ${c.border}`,
                      outline: active ? "2px solid var(--color-ink-2)" : "none",
                      outlineOffset: 2,
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {warning && (
            <p
              className="dt-secondary"
              style={{ color: "var(--color-ink-2)" }}
              role="status"
            >
              ⚠ {warning}
            </p>
          )}
          {error && (
            <p
              className="dt-secondary"
              style={{ color: "var(--color-status-miss)" }}
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2 mt-2">
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
              과목 삭제
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
