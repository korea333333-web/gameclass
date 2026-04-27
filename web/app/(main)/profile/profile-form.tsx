"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  studentId: string;
  name: string;
  grade: number | null;
};

export function ProfileForm({ initialValues }: { initialValues: Initial }) {
  const router = useRouter();
  const [grade, setGrade] = useState<number | null>(initialValues.grade);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const isFirstTime = initialValues.grade === null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (grade === null || ![1, 2, 3, 4].includes(grade)) {
      setError("학년을 선택해 주세요");
      return;
    }
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ grade })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSavedAt(Date.now());

    if (isFirstTime) {
      router.replace("/");
      router.refresh();
    } else {
      router.refresh();
    }
  }

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

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <span className="dt-caps mb-2 block">학년</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((g) => {
              const active = grade === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  disabled={saving}
                  className="dt-btn-card flex-1"
                  style={{
                    background: active
                      ? "var(--color-surface-2)"
                      : "var(--color-surface-3)",
                    borderColor: active
                      ? "var(--color-ink-3)"
                      : "var(--hairline)",
                    color: "var(--color-ink-1)",
                  }}
                  aria-pressed={active}
                >
                  {g}학년
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p
            className="dt-secondary"
            style={{ color: "var(--color-status-miss)" }}
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="dt-btn-card mt-2 w-full"
        >
          {saving ? "저장 중..." : isFirstTime ? "시작하기" : "변경 사항 저장"}
        </button>

        {savedAt && <p className="dt-meta text-center">저장되었습니다</p>}
      </form>

      <hr className="dt-hairline my-10" />

      <button type="button" onClick={onSignOut} className="dt-btn-text">
        로그아웃
      </button>
    </>
  );
}
