"use client";

import { useEffect, useState } from "react";
import {
  COLORS,
  DAY_LABELS,
  minutesToHHMM,
  type ScheduleEntry,
} from "@/lib/schedule";

export function TodayMiniList({ entries }: { entries: ScheduleEntry[] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const day = now.getDay(); // 0=일, 1=월, ..., 6=토
  if (day < 1 || day > 5) return null;

  const todayEntries = entries
    .filter((e) => e.day_of_week === day)
    .sort((a, b) => a.start_minute - b.start_minute);

  if (todayEntries.length === 0) return null;

  const nowMinute = now.getHours() * 60 + now.getMinutes();

  return (
    <section className="dt-card mb-4" aria-labelledby="today-mini">
      <p id="today-mini" className="dt-caps mb-3">
        오늘 ({DAY_LABELS[day - 1]}) 시간표
      </p>
      <ul className="space-y-2">
        {todayEntries.map((e) => {
          const c = COLORS[e.color];
          const inProgress =
            nowMinute >= e.start_minute && nowMinute < e.end_minute;
          const finished = nowMinute >= e.end_minute;
          return (
            <li
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                background: inProgress ? c.bg : "transparent",
                borderLeft: `3px solid ${inProgress ? c.border : "var(--hairline)"}`,
                borderRadius: 6,
                opacity: finished ? 0.5 : 1,
              }}
            >
              <span
                className="dt-mono"
                style={{
                  minWidth: 90,
                  fontSize: 13,
                  color: "var(--color-ink-2)",
                }}
              >
                {minutesToHHMM(e.start_minute)}–{minutesToHHMM(e.end_minute)}
              </span>
              <span
                style={{
                  fontWeight: inProgress ? 600 : 500,
                  color: inProgress ? c.text : "var(--color-ink-1)",
                }}
              >
                {e.name}
              </span>
              {e.location && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-ink-3)",
                  }}
                >
                  · {e.location}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
