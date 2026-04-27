import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ColorKey, ScheduleEntry } from "@/lib/schedule";
import { ScheduleClient } from "./schedule-client";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entries }, { data: shareCode }] = await Promise.all([
    supabase
      .from("schedule_entries")
      .select(
        "id, name, day_of_week, start_minute, end_minute, location, professor, color",
      )
      .eq("user_id", user.id)
      .order("day_of_week", { ascending: true })
      .order("start_minute", { ascending: true }),
    supabase
      .from("share_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const initialEntries: ScheduleEntry[] = (entries ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    day_of_week: e.day_of_week as number,
    start_minute: e.start_minute as number,
    end_minute: e.end_minute as number,
    location: (e.location as string | null) ?? null,
    professor: (e.professor as string | null) ?? null,
    color: (e.color as ColorKey) ?? "mustard",
  }));

  return (
    <main>
      <header className="mb-6">
        <p className="dt-caps mb-2">SCHEDULE</p>
        <h1 className="dt-h1">시간표</h1>
        <p className="dt-secondary mt-1">
          빈 칸을 누르면 그 시간으로 새 과목을 등록합니다
        </p>
      </header>

      <ScheduleClient
        initialEntries={initialEntries}
        initialShareCode={(shareCode?.code as string | undefined) ?? null}
      />
    </main>
  );
}
