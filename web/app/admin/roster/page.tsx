import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { RosterAdmin } from "./roster-admin";

export const dynamic = "force-dynamic";

type RosterRow = {
  student_id: string;
  name: string;
  created_at: string;
  registered: boolean;
};

export default async function AdminRosterPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: roster }, { data: profiles }] = await Promise.all([
    supabase
      .from("roster")
      .select("student_id, name, created_at")
      .order("student_id", { ascending: true }),
    supabase.from("profiles").select("student_id").not("student_id", "is", null),
  ]);

  const registeredSet = new Set(
    (profiles ?? []).map((p) => p.student_id as string),
  );

  const rows: RosterRow[] = (roster ?? []).map((r) => ({
    student_id: r.student_id as string,
    name: r.name as string,
    created_at: r.created_at as string,
    registered: registeredSet.has(r.student_id as string),
  }));

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--color-surface-1)" }}
    >
      <main className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <Link href="/admin" className="dt-btn-text mb-3 inline-block">
            ← 관리 화면
          </Link>
          <h1 className="dt-h1 mb-1">명단 관리</h1>
          <p className="dt-secondary">
            현재 {rows.length}명 · 가입 완료 {rows.filter((r) => r.registered).length}명
          </p>
        </header>

        <RosterAdmin initialRows={rows} />
      </main>
    </div>
  );
}
