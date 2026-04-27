"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  COLORS,
  DAY_LABELS,
  FIRST_DAY,
  GRID_END_MINUTE,
  GRID_START_MINUTE,
  LAST_DAY,
  SLOT_MINUTES,
  minutesToHHMM,
  type ScheduleEntry,
} from "@/lib/schedule";
import { EntryForm } from "./entry-form";
import { ShareSection } from "./share-section";

const HOUR_ROWS = Math.floor(
  (GRID_END_MINUTE - GRID_START_MINUTE) / SLOT_MINUTES,
);

type ModalState =
  | { kind: "closed" }
  | { kind: "new"; day: number; startMinute: number }
  | { kind: "edit"; entry: ScheduleEntry };

export function ScheduleClient({
  initialEntries,
  initialShareCode,
}: {
  initialEntries: ScheduleEntry[];
  initialShareCode: string | null;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<ScheduleEntry[]>(initialEntries);
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });

  const supabase = useMemo(() => createClient(), []);

  function openNew(day: number, startMinute: number) {
    setModal({ kind: "new", day, startMinute });
  }

  function openEdit(entry: ScheduleEntry) {
    setModal({ kind: "edit", entry });
  }

  function close() {
    setModal({ kind: "closed" });
  }

  async function onSave(input: Omit<ScheduleEntry, "id"> & { id?: string }) {
    const { id, ...payload } = input;
    if (id) {
      // 수정
      const { data, error } = await supabase
        .from("schedule_entries")
        .update(payload)
        .eq("id", id)
        .select(
          "id, name, day_of_week, start_minute, end_minute, location, professor, color",
        )
        .single();
      if (error || !data) {
        alert("저장 실패: " + (error?.message ?? "알 수 없는 오류"));
        return;
      }
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? (data as ScheduleEntry) : e)),
      );
    } else {
      // 신규
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("로그인이 필요합니다");
        return;
      }
      const { data, error } = await supabase
        .from("schedule_entries")
        .insert({ ...payload, user_id: user.id })
        .select(
          "id, name, day_of_week, start_minute, end_minute, location, professor, color",
        )
        .single();
      if (error || !data) {
        alert("저장 실패: " + (error?.message ?? "알 수 없는 오류"));
        return;
      }
      setEntries((prev) => [...prev, data as ScheduleEntry]);
    }
    close();
  }

  async function onDelete(id: string) {
    if (!confirm("이 과목을 삭제하시겠습니까?")) return;
    const { error } = await supabase
      .from("schedule_entries")
      .delete()
      .eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    close();
  }

  function onCopiedSchedule() {
    router.refresh();
  }

  return (
    <>
      {/* 데스크톱: 그리드 / 모바일: 일별 리스트 */}
      <div className="hidden md:block">
        <DesktopGrid entries={entries} onClickEmpty={openNew} onClickEntry={openEdit} />
      </div>
      <div className="md:hidden">
        <MobileDayList entries={entries} onClickEmpty={openNew} onClickEntry={openEdit} />
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => openNew(1, 9 * 60)}
          className="dt-btn-card w-full"
        >
          + 과목 추가
        </button>
      </div>

      <ShareSection
        initialShareCode={initialShareCode}
        hasEntries={entries.length > 0}
        onCopied={onCopiedSchedule}
      />

      {modal.kind !== "closed" && (
        <EntryForm
          mode={modal.kind}
          initial={
            modal.kind === "edit"
              ? modal.entry
              : {
                  day_of_week: modal.day,
                  start_minute: modal.startMinute,
                  end_minute: Math.min(
                    modal.startMinute + 60,
                    GRID_END_MINUTE,
                  ),
                }
          }
          existingEntries={entries}
          onClose={close}
          onSave={onSave}
          onDelete={modal.kind === "edit" ? () => onDelete(modal.entry.id) : undefined}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Desktop grid view (월~금 가로, 9시~22시 세로)
// ────────────────────────────────────────────────────────────────────────
function DesktopGrid({
  entries,
  onClickEmpty,
  onClickEntry,
}: {
  entries: ScheduleEntry[];
  onClickEmpty: (day: number, startMinute: number) => void;
  onClickEntry: (entry: ScheduleEntry) => void;
}) {
  // 시간 라벨 (정시만)
  const hours: number[] = [];
  for (let h = 9; h <= 22; h++) hours.push(h);

  return (
    <div
      className="dt-card overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: "60px repeat(5, 1fr)",
        gridTemplateRows: `28px repeat(${HOUR_ROWS}, 24px)`,
        gap: 0,
      }}
    >
      {/* 헤더 */}
      <div></div>
      {DAY_LABELS.map((d) => (
        <div
          key={d}
          className="dt-caps text-center"
          style={{
            color: "var(--color-ink-2)",
            paddingTop: 6,
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          {d}
        </div>
      ))}

      {/* 시간 라벨 + 셀 */}
      {hours.map((h, hourIdx) => {
        const slotsPerHour = 60 / SLOT_MINUTES;
        return (
          <div
            key={h}
            className="dt-meta"
            style={{
              gridColumn: 1,
              gridRow: `${2 + hourIdx * slotsPerHour} / span ${slotsPerHour}`,
              color: "var(--color-ink-3)",
              paddingRight: 6,
              textAlign: "right",
              borderRight: "1px solid var(--hairline)",
            }}
          >
            {String(h).padStart(2, "0")}
          </div>
        );
      })}

      {/* 빈 슬롯 (클릭 영역) */}
      {Array.from({ length: HOUR_ROWS }).map((_, rowIdx) =>
        Array.from({ length: LAST_DAY }).map((_, dayIdx) => {
          const day = dayIdx + FIRST_DAY;
          const startMinute = GRID_START_MINUTE + rowIdx * SLOT_MINUTES;
          const isHourMark = startMinute % 60 === 0;
          return (
            <button
              key={`slot-${rowIdx}-${dayIdx}`}
              type="button"
              onClick={() => onClickEmpty(day, startMinute)}
              aria-label={`${DAY_LABELS[dayIdx]} ${minutesToHHMM(startMinute)} 추가`}
              style={{
                gridColumn: dayIdx + 2,
                gridRow: rowIdx + 2,
                borderTop: isHourMark
                  ? "1px solid var(--hairline)"
                  : "1px dashed transparent",
                borderRight:
                  dayIdx < LAST_DAY - 1
                    ? "1px solid var(--hairline)"
                    : "none",
                background: "transparent",
                cursor: "pointer",
              }}
              className="hover:bg-[color:var(--color-surface-2)]"
            />
          );
        }),
      )}

      {/* 과목 카드 */}
      {entries.map((e) => {
        const c = COLORS[e.color];
        const startRow =
          Math.floor((e.start_minute - GRID_START_MINUTE) / SLOT_MINUTES) + 2;
        const endRow =
          Math.floor((e.end_minute - GRID_START_MINUTE) / SLOT_MINUTES) + 2;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onClickEntry(e)}
            style={{
              gridColumn: e.day_of_week + 1,
              gridRow: `${startRow} / ${endRow}`,
              background: c.bg,
              borderLeft: `3px solid ${c.border}`,
              color: c.text,
              padding: "4px 6px",
              margin: 1,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              textAlign: "left",
              overflow: "hidden",
              cursor: "pointer",
              lineHeight: 1.2,
            }}
            aria-label={`${e.name} 수정`}
          >
            <div style={{ fontWeight: 600 }}>{e.name}</div>
            {e.location && (
              <div style={{ opacity: 0.8, fontSize: 11 }}>{e.location}</div>
            )}
            <div style={{ opacity: 0.6, fontSize: 11 }}>
              {minutesToHHMM(e.start_minute)}–{minutesToHHMM(e.end_minute)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Mobile: 요일별 리스트
// ────────────────────────────────────────────────────────────────────────
function MobileDayList({
  entries,
  onClickEmpty,
  onClickEntry,
}: {
  entries: ScheduleEntry[];
  onClickEmpty: (day: number, startMinute: number) => void;
  onClickEntry: (entry: ScheduleEntry) => void;
}) {
  return (
    <div className="space-y-4">
      {DAY_LABELS.map((label, idx) => {
        const day = idx + FIRST_DAY;
        const dayEntries = entries
          .filter((e) => e.day_of_week === day)
          .sort((a, b) => a.start_minute - b.start_minute);
        return (
          <section key={day} className="dt-card">
            <p className="dt-caps mb-3">{label}요일</p>
            {dayEntries.length === 0 ? (
              <button
                type="button"
                onClick={() => onClickEmpty(day, GRID_START_MINUTE)}
                className="dt-btn-text"
              >
                + 과목 추가
              </button>
            ) : (
              <ul className="space-y-2">
                {dayEntries.map((e) => {
                  const c = COLORS[e.color];
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onClickEntry(e)}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 10,
                          background: c.bg,
                          borderLeft: `3px solid ${c.border}`,
                          color: c.text,
                          padding: "10px 12px",
                          borderRadius: 8,
                          textAlign: "left",
                        }}
                      >
                        <span
                          className="dt-mono"
                          style={{ minWidth: 88, fontSize: 12, opacity: 0.7 }}
                        >
                          {minutesToHHMM(e.start_minute)}–{minutesToHHMM(e.end_minute)}
                        </span>
                        <span style={{ fontWeight: 600 }}>{e.name}</span>
                        {e.location && (
                          <span style={{ opacity: 0.7, fontSize: 12 }}>
                            · {e.location}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
