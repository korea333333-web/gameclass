"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  colorOf,
  formatDueIn,
  isOverdue,
  labelOf,
  type Task,
} from "@/lib/tasks";

export function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="dt-card mb-4" aria-labelledby="upcoming-tasks">
      <div className="flex items-center justify-between mb-3">
        <p id="upcoming-tasks" className="dt-caps">
          임박 과제
        </p>
        <Link href="/tasks" className="dt-btn-text">
          전체 보기 →
        </Link>
      </div>

      {tasks.length === 0 ? (
        <>
          <p className="dt-task" style={{ color: "var(--color-ink-3)" }}>
            등록된 과제가 없습니다
          </p>
          <div className="mt-4">
            <Link href="/tasks" className="dt-btn-text">
              과제 추가하러 가기 →
            </Link>
          </div>
        </>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => {
            const overdue = isOverdue(t, now);
            return (
              <li
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "6px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "baseline",
                      marginBottom: 2,
                    }}
                  >
                    {t.subject_label && (
                      <span
                        className="dt-meta"
                        style={{ color: "var(--color-ink-3)" }}
                      >
                        ({t.subject_label})
                      </span>
                    )}
                    <span
                      style={{
                        fontWeight: 500,
                        color: "var(--color-ink-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.title}
                    </span>
                  </div>
                  <span
                    className="dt-meta"
                    style={{ color: colorOf(t.label) }}
                  >
                    {labelOf(t.label)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: overdue
                      ? "var(--color-status-miss)"
                      : "var(--color-ink-2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDueIn(t.due_at, now)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
