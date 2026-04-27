import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: rosterCount }, { count: profileCount }] = await Promise.all([
    supabase.from("roster").select("student_id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
  ]);

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--color-surface-1)" }}
    >
      <main className="mx-auto w-full max-w-2xl">
        <header className="mb-10">
          <p className="dt-caps mb-2">GAMECLASS · ADMIN</p>
          <h1 className="dt-h1 mb-1">관리 화면</h1>
          <p className="dt-secondary">학과 운영자 작업 공간입니다</p>
        </header>

        <section className="dt-card mb-5">
          <p className="dt-caps mb-3">현황</p>
          <div className="flex justify-between">
            <div>
              <p className="dt-secondary">사전 등록 명단</p>
              <p className="dt-h1">{rosterCount ?? 0}명</p>
            </div>
            <div>
              <p className="dt-secondary">가입 완료</p>
              <p className="dt-h1">{profileCount ?? 0}명</p>
            </div>
          </div>
        </section>

        <nav className="space-y-3">
          <Link href="/admin/roster" className="dt-card block">
            <p className="dt-task mb-1">명단 관리 →</p>
            <p className="dt-secondary">
              학번/이름 일괄 등록, 한 명씩 추가/삭제
            </p>
          </Link>

          <Link href="/admin/reset" className="dt-card block">
            <p className="dt-task mb-1">학생 비밀번호 리셋 →</p>
            <p className="dt-secondary">학생이 비번을 잊었을 때 임시 비번 발급</p>
          </Link>
        </nav>

        <hr className="dt-hairline my-10" />

        <form action="/admin/signout" method="post">
          <button type="submit" className="dt-btn-text">
            로그아웃
          </button>
        </form>
      </main>
    </div>
  );
}
