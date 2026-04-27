import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ColorKey } from "@/lib/schedule";
import type { Task, TaskLabel } from "@/lib/tasks";
import { TasksClient } from "./tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: tasks }, { data: entries }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_at, schedule_entry_id, subject_label, label, memo, completed_at")
      .eq("user_id", user.id)
      .order("due_at", { ascending: true }),
    supabase
      .from("schedule_entries")
      .select("id, name, color")
      .eq("user_id", user.id),
  ]);

  const initialTasks: Task[] = (tasks ?? []).map((t) => ({
    id: t.id as string,
    title: t.title as string,
    due_at: t.due_at as string,
    schedule_entry_id: (t.schedule_entry_id as string | null) ?? null,
    subject_label: (t.subject_label as string | null) ?? null,
    label: (t.label as TaskLabel) ?? "personal",
    memo: (t.memo as string | null) ?? null,
    completed_at: (t.completed_at as string | null) ?? null,
  }));

  const subjects = (entries ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    color: (e.color as ColorKey) ?? "mustard",
  }));

  return (
    <main>
      <header className="mb-6">
        <p className="dt-caps mb-2">TASKS</p>
        <h1 className="dt-h1">과제</h1>
        <p className="dt-secondary mt-1">
          마감일 가까운 순서대로 표시됩니다
        </p>
      </header>

      <TasksClient initialTasks={initialTasks} subjects={subjects} />
    </main>
  );
}
