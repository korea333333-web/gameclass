"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  studentId: string;
  name: string;
};

export function ProfileForm({ initialValues }: { initialValues: Initial }) {
  const router = useRouter();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <section className="dt-card mb-8">
        <p className="dt-caps mb-3">계정 정보</p>
        <div className="space-y-2">
          <p className="dt-secondary">
            <span className="dt-caps mr-3">학번</span>
            <span style={{ color: "var(--color-ink-1)" }}>
              {initialValues.studentId}
            </span>
          </p>
          <p className="dt-secondary">
            <span className="dt-caps mr-3">이름</span>
            <span style={{ color: "var(--color-ink-1)" }}>
              {initialValues.name}
            </span>
          </p>
        </div>
      </section>

      <hr className="dt-hairline my-10" />

      <button type="button" onClick={onSignOut} className="dt-btn-text">
        로그아웃
      </button>
    </>
  );
}
