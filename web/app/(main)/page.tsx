import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ColorKey, ScheduleEntry } from "@/lib/schedule";
import type { Task, TaskLabel } from "@/lib/tasks";
import { NextClassWidget } from "./_home/next-class-widget";
import { QuickMemos, type QuickMemo } from "./_home/quick-memos";
import { TodayMiniList } from "./_home/today-mini-list";
import { UpcomingTasks } from "./_home/upcoming-tasks";

export const dynamic = "force-dynamic";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatKoreanDate(d: Date) {
  return `${d.getFullYear()}년 ${pad2(d.getMonth() + 1)}월 ${pad2(d.getDate())}일`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/profile");

  const [{ data: entries }, { data: tasks }, { data: memos }] = await Promise.all([
    supabase
      .from("schedule_entries")
      .select(
        "id, name, day_of_week, start_minute, end_minute, location, professor, color",
      )
      .eq("user_id", user.id),
    supabase
      .from("tasks")
      .select("id, title, due_at, schedule_entry_id, subject_label, label, memo, completed_at")
      .eq("user_id", user.id)
      .is("completed_at", null)
      .order("due_at", { ascending: true })
      .limit(3),
    supabase
      .from("quick_memos")
      .select("id, content, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const scheduleEntries: ScheduleEntry[] = (entries ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    day_of_week: e.day_of_week as number,
    start_minute: e.start_minute as number,
    end_minute: e.end_minute as number,
    location: (e.location as string | null) ?? null,
    professor: (e.professor as string | null) ?? null,
    color: (e.color as ColorKey) ?? "mustard",
  }));

  const upcomingTasks: Task[] = (tasks ?? []).map((t) => ({
    id: t.id as string,
    title: t.title as string,
    due_at: t.due_at as string,
    schedule_entry_id: (t.schedule_entry_id as string | null) ?? null,
    subject_label: (t.subject_label as string | null) ?? null,
    label: (t.label as TaskLabel) ?? "personal",
    memo: (t.memo as string | null) ?? null,
    completed_at: (t.completed_at as string | null) ?? null,
  }));

  const initialMemos: QuickMemo[] = (memos ?? []).map((m) => ({
    id: m.id as string,
    content: m.content as string,
    completed_at: (m.completed_at as string | null) ?? null,
  }));

  const today = new Date();

  return (
    <main>
      <header className="mb-8">
        <p className="dt-caps mb-2">GAMECLASS</p>
        <h1 className="dt-h1">{formatKoreanDate(today)}</h1>
        <p className="dt-secondary mt-1">
          {profile.name}님 · 게임학과
        </p>
      </header>

      <NextClassWidget entries={scheduleEntries} />

      <TodayMiniList entries={scheduleEntries} />

      <QuickMemos initialMemos={initialMemos} />

      <UpcomingTasks tasks={upcomingTasks} />

      <section aria-labelledby="active-team" className="dt-card mb-4">
        <p id="active-team" className="dt-caps mb-3">
          진행 중인 팀프로젝트
        </p>
        <p className="dt-task" style={{ color: "var(--color-ink-3)" }}>
          소속된 팀이 없습니다
        </p>
        <div className="mt-4">
          <Link href="/teams" className="dt-btn-text">
            팀 만들거나 참여하기 →
          </Link>
        </div>
      </section>

      <div className="dt-card-quote mt-6">
        <p className="dt-quote">
          공부도 게임처럼, 작은 진척이 모여 큰 결과를 만듭니다
        </p>
        <p className="dt-quote opacity-70">
          Small steady progress beats sporadic effort
        </p>
      </div>
    </main>
  );
}
