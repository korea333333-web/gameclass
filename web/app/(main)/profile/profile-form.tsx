"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const STUDENT_ID_PATTERN = /^\d{8}$/;

type FormErrors = {
  studentId?: string;
  name?: string;
  grade?: string;
  submit?: string;
};

type Initial = {
  studentId: string;
  name: string;
  grade: number;
} | null;

export function ProfileForm({ initialValues }: { initialValues: Initial }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(initialValues?.studentId ?? "");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [grade, setGrade] = useState<number>(initialValues?.grade ?? 1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!STUDENT_ID_PATTERN.test(studentId.trim())) {
      next.studentId = "학번은 8자리 숫자여야 합니다";
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 10) {
      next.name = "이름은 2~10자 사이여야 합니다";
    }
    if (![1, 2, 3, 4].includes(grade)) {
      next.grade = "학년은 1~4 사이여야 합니다";
    }
    return next;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrors({ submit: "로그인이 필요합니다" });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        student_id: studentId.trim(),
        name: name.trim(),
        grade,
      },
      { onConflict: "id" },
    );

    setSaving(false);

    if (error) {
      const message =
        error.code === "23505"
          ? "이미 등록된 학번입니다"
          : error.message;
      setErrors({ submit: message });
      return;
    }

    setSavedAt(Date.now());

    if (!initialValues) {
      // 첫 작성 → 홈으로
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
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="studentId" className="dt-caps mb-2 block">
            학번
          </label>
          <input
            id="studentId"
            type="text"
            inputMode="numeric"
            pattern="\d{8}"
            maxLength={8}
            placeholder="20251234"
            value={studentId}
            onChange={(e) =>
              setStudentId(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
            disabled={saving}
            className="dt-input"
            aria-invalid={!!errors.studentId}
            aria-describedby={errors.studentId ? "studentId-error" : undefined}
          />
          {errors.studentId && (
            <p
              id="studentId-error"
              className="dt-secondary mt-2"
              style={{ color: "var(--color-status-miss)" }}
              role="alert"
            >
              {errors.studentId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="dt-caps mb-2 block">
            이름
          </label>
          <input
            id="name"
            type="text"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 10))}
            maxLength={10}
            disabled={saving}
            className="dt-input"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p
              id="name-error"
              className="dt-secondary mt-2"
              style={{ color: "var(--color-status-miss)" }}
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

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
          {errors.grade && (
            <p
              className="dt-secondary mt-2"
              style={{ color: "var(--color-status-miss)" }}
              role="alert"
            >
              {errors.grade}
            </p>
          )}
        </div>

        {errors.submit && (
          <p
            className="dt-secondary"
            style={{ color: "var(--color-status-miss)" }}
            role="alert"
          >
            {errors.submit}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="dt-btn-card mt-2 w-full"
        >
          {saving ? "저장 중..." : initialValues ? "변경 사항 저장" : "프로필 저장"}
        </button>

        {savedAt && (
          <p className="dt-meta text-center">저장되었습니다</p>
        )}
      </form>

      <hr className="dt-hairline my-10" />

      <button
        type="button"
        onClick={onSignOut}
        className="dt-btn-text"
      >
        로그아웃
      </button>
    </>
  );
}
