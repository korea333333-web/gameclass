"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  COLORS,
  DAY_LABELS,
  FIRST_DAY,
  LAST_DAY,
  PERIODS,
  PERIOD_MINUTES,
  GRID_START_MINUTE,
  type ScheduleEntry,
} from "@/lib/schedule";
import { EntryForm } from "./entry-form";
import { ShareSection } from "./share-section";

const GRID_HEADER_ROW = 1;

type ModalState =
  | { kind: "closed" }
  | { kind: "new"; day: number; periodIndex: number }
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

  function openNew(day: number, periodIndex: number) {
    setModal({ kind: "new", day, periodIndex });
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
      <ScheduleGrid entries={entries} onClickEmpty={openNew} onClickEntry={openEdit} />

      <div className="mt-8">
        <button
          type="button"
          onClick={() => openNew(1, 1)}
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
                  start_minute:
                    PERIODS[Math.max(0, Math.min(PERIODS.length - 1, modal.periodIndex))]
                      .startMinute,
                  end_minute:
                    PERIODS[Math.max(0, Math.min(PERIODS.length - 1, modal.periodIndex))]
                      .endMinute,
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
// 학교 시간표 형태 그리드 (월~금 가로 / 0교시~13교시 세로)
// 각 행 = 1교시 = 60분
// 모바일/데스크톱 모두 동일한 그리드 (모바일에서는 셀이 좁아짐)
// ────────────────────────────────────────────────────────────────────────
function ScheduleGrid({
  entries,
  onClickEmpty,
  onClickEntry,
}: {
  entries: ScheduleEntry[];
  onClickEmpty: (day: number, periodIndex: number) => void;
  onClickEntry: (entry: ScheduleEntry) => void;
}) {
  return (
    <div
      className="dt-card overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(54px, 78px) repeat(5, 1fr)",
        gridTemplateRows: `34px repeat(${PERIODS.length}, 52px)`,
        gap: 0,
        padding: 0,
      }}
    >
      {/* 좌상단 빈 칸 */}
      <div
        style={{
          borderBottom: "1px solid var(--hairline)",
          borderRight: "1px solid var(--hairline)",
        }}
      />

      {/* 요일 헤더 */}
      {DAY_LABELS.map((d) => (
        <div
          key={d}
          className="dt-caps text-center"
          style={{
            color: "var(--color-ink-2)",
            paddingTop: 10,
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          {d}
        </div>
      ))}

      {/* 교시 라벨 (왼쪽 첫 열) */}
      {PERIODS.map((p, idx) => (
        <div
          key={`label-${p.index}`}
          style={{
            gridColumn: 1,
            gridRow: GRID_HEADER_ROW + 1 + idx,
            borderRight: "1px solid var(--hairline)",
            borderTop:
              idx === 0 ? "none" : "1px solid var(--hairline)",
            padding: "6px 8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-ink-1)",
            }}
          >
            {p.label}
          </div>
          <div
            className="dt-mono"
            style={{
              fontSize: 11,
              color: "var(--color-ink-3)",
              marginTop: 1,
            }}
          >
            {p.startLabel}~{p.endLabel}
          </div>
        </div>
      ))}

      {/* 빈 셀 (교시 × 요일) */}
      {PERIODS.map((p, periodIdx) =>
        Array.from({ length: LAST_DAY }).map((_, dayIdx) => {
          const day = dayIdx + FIRST_DAY;
          return (
            <button
              key={`slot-${periodIdx}-${dayIdx}`}
              type="button"
              onClick={() => onClickEmpty(day, p.index)}
              aria-label={`${DAY_LABELS[dayIdx]} ${p.label} 추가`}
              style={{
                gridColumn: dayIdx + 2,
                gridRow: GRID_HEADER_ROW + 1 + periodIdx,
                borderTop:
                  periodIdx === 0 ? "none" : "1px solid var(--hairline)",
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
        const startPeriodIdx = Math.floor(
          (e.start_minute - GRID_START_MINUTE) / PERIOD_MINUTES,
        );
        const endPeriodIdx = Math.ceil(
          (e.end_minute - GRID_START_MINUTE) / PERIOD_MINUTES,
        );
        const startRow = GRID_HEADER_ROW + 1 + startPeriodIdx;
        const endRow = GRID_HEADER_ROW + 1 + endPeriodIdx;
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
              padding: "4px 5px",
              margin: 2,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              textAlign: "left",
              overflow: "hidden",
              cursor: "pointer",
              lineHeight: 1.25,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              wordBreak: "break-word",
            }}
            aria-label={`${e.name} 수정`}
          >
            <div
              style={{
                fontWeight: 600,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {e.name}
            </div>
            {e.location && (
              <div
                style={{
                  opacity: 0.8,
                  fontSize: 10,
                  marginTop: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.location}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

