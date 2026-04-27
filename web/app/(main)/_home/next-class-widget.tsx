"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COLORS,
  findNextClass,
  formatMinutesUntil,
  minutesToHHMM,
  type ScheduleEntry,
} from "@/lib/schedule";

export function NextClassWidget({ entries }: { entries: ScheduleEntry[] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (entries.length === 0) {
    return (
      <section className="dt-card mb-4" aria-labelledby="next-class-empty">
        <p id="next-class-empty" className="dt-caps mb-3">
          다음 수업
        </p>
        <p className="dt-task" style={{ color: "var(--color-ink-3)" }}>
          시간표를 먼저 입력해 주세요
        </p>
        <div className="mt-4">
          <Link href="/schedule" className="dt-btn-text">
            시간표 입력하러 가기 →
          </Link>
        </div>
      </section>
    );
  }

  const next = findNextClass(entries, now);

  if (next.kind === "in_progress") {
    const c = COLORS[next.entry.color];
    return (
      <section
        className="dt-card mb-4"
        aria-labelledby="next-class-progress"
        style={{
          background: c.bg,
          borderLeft: `4px solid ${c.border}`,
        }}
      >
        <p id="next-class-progress" className="dt-caps mb-2" style={{ color: c.text }}>
          진행 중
        </p>
        <p
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: c.text,
            marginBottom: 4,
          }}
        >
          {next.entry.name}
        </p>
        <p style={{ color: c.text, opacity: 0.8, fontSize: 14 }}>
          {minutesToHHMM(next.entry.start_minute)}–
          {minutesToHHMM(next.entry.end_minute)}
          {next.entry.location ? ` · ${next.entry.location}` : ""}
        </p>
        <p
          style={{
            color: c.text,
            opacity: 0.7,
            fontSize: 13,
            marginTop: 8,
          }}
        >
          {formatMinutesUntil(next.minutesUntilEnd)} 후 종료
        </p>
      </section>
    );
  }

  if (next.kind === "soon") {
    const c = COLORS[next.entry.color];
    return (
      <section className="dt-card mb-4" aria-labelledby="next-class">
        <p id="next-class" className="dt-caps mb-2">
          다음 수업
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "var(--color-ink-1)",
            lineHeight: 1.2,
            marginBottom: 6,
          }}
        >
          {formatMinutesUntil(next.minutesUntil)}
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            background: c.bg,
            borderLeft: `3px solid ${c.border}`,
            color: c.text,
            borderRadius: 6,
            marginTop: 4,
          }}
        >
          <span style={{ fontWeight: 600 }}>{next.entry.name}</span>
          <span style={{ opacity: 0.7, fontSize: 13 }}>
            {minutesToHHMM(next.entry.start_minute)}
          </span>
          {next.entry.location && (
            <span style={{ opacity: 0.7, fontSize: 13 }}>
              · {next.entry.location}
            </span>
          )}
        </div>
      </section>
    );
  }

  // today_done / weekend
  return (
    <section className="dt-card mb-4">
      <p className="dt-caps mb-3">다음 수업</p>
      <p className="dt-task" style={{ color: "var(--color-ink-3)" }}>
        {next.kind === "weekend" ? "이번 주 수업이 끝났습니다" : "오늘 수업이 모두 끝났습니다"}
      </p>
    </section>
  );
}
