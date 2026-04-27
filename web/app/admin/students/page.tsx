import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { StudentsAdmin, type StudentRow } from "./students-admin";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, student_id, name, is_active, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const rows: StudentRow[] = (profiles ?? []).map((p) => ({
    id: p.id as string,
    student_id: (p.student_id as string | null) ?? "",
    name: (p.name as string | null) ?? "",
    is_active: (p.is_active as boolean | null) ?? false,
    created_at: p.created_at as string,
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
          <h1 className="dt-h1 mb-1">가입 학생 관리</h1>
          <p className="dt-secondary">
            가입 완료 {rows.length}명 · 승인 {rows.filter((r) => r.is_active).length}명 · 대기 {rows.filter((r) => !r.is_active).length}명
          </p>
        </header>

        <StudentsAdmin initialRows={rows} />
      </main>
    </div>
  );
}
