import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  // 인증/승인/어드민 체크는 (main)/layout에서 이미 처리됨
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, grade")
    .eq("id", user.id)
    .maybeSingle();

  // 가입 흐름에서 grade를 받으므로 비어있을 일은 없지만, 안전장치
  if (!profile || !profile.grade) redirect("/profile");

  const today = new Date();

  return (
    <main>
      <header className="mb-8">
        <p className="dt-caps mb-2">GAMECLASS</p>
        <h1 className="dt-h1">{formatKoreanDate(today)}</h1>
        <p className="dt-secondary mt-1">
          {profile.name}님, {profile.grade}학년 · 게임학과
        </p>
      </header>

      <section aria-labelledby="next-class" className="dt-card mb-4">
        <p id="next-class" className="dt-caps mb-3">
          다음 수업
        </p>
        <p className="dt-task" style={{ color: "var(--color-ink-3)" }}>
          아직 시간표가 비어 있습니다
        </p>
        <div className="mt-4">
          <Link href="/schedule" className="dt-btn-text">
            시간표 입력하러 가기 →
          </Link>
        </div>
      </section>

      <section aria-labelledby="upcoming-tasks" className="dt-card mb-4">
        <p id="upcoming-tasks" className="dt-caps mb-3">
          임박 과제
        </p>
        <p className="dt-task" style={{ color: "var(--color-ink-3)" }}>
          등록된 과제가 없습니다
        </p>
        <div className="mt-4">
          <Link href="/tasks" className="dt-btn-text">
            과제 추가하러 가기 →
          </Link>
        </div>
      </section>

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
