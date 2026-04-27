"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isValidStudentId,
  isValidName,
  sanitizeStudentId,
  sanitizeName,
  studentIdToEmail,
  validatePassword,
  STUDENT_ID_INVALID_ERROR,
  NAME_INVALID_ERROR,
  NOT_IN_ROSTER_ERROR,
  PASSWORD_MISMATCH_ERROR,
  ALREADY_REGISTERED_ERROR,
} from "@/lib/auth/student-id";

type Step = "identity" | "password";
type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identity");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onIdentitySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidStudentId(studentId)) {
      setStatus({ kind: "error", message: STUDENT_ID_INVALID_ERROR });
      return;
    }
    if (!isValidName(name)) {
      setStatus({ kind: "error", message: NAME_INVALID_ERROR });
      return;
    }
    if (grade === null || ![1, 2, 3, 4].includes(grade)) {
      setStatus({ kind: "error", message: "학년을 선택해 주세요" });
      return;
    }

    setStatus({ kind: "loading" });
    const supabase = createClient();
    const { data, error } = await supabase.rpc("verify_roster", {
      p_student_id: studentId.trim(),
      p_name: name.trim(),
    });

    if (error) {
      setStatus({ kind: "error", message: "확인 중 오류가 발생했습니다" });
      return;
    }
    if (data !== true) {
      setStatus({ kind: "error", message: NOT_IN_ROSTER_ERROR });
      return;
    }

    setStatus({ kind: "idle" });
    setStep("password");
  }

  async function onPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pwError = validatePassword(password);
    if (pwError) {
      setStatus({ kind: "error", message: pwError });
      return;
    }
    if (password !== passwordConfirm) {
      setStatus({ kind: "error", message: PASSWORD_MISMATCH_ERROR });
      return;
    }

    setStatus({ kind: "loading" });

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: studentId.trim(),
        name: name.trim(),
        grade,
        password,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!res.ok) {
      const message =
        json.error === ALREADY_REGISTERED_ERROR
          ? ALREADY_REGISTERED_ERROR
          : json.error || "가입에 실패했습니다";
      setStatus({ kind: "error", message });
      return;
    }

    // 가입 성공 → 자동 로그인 → 승인 대기 페이지로
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: studentIdToEmail(studentId),
      password,
    });

    if (signInError) {
      setStatus({
        kind: "error",
        message:
          "가입은 됐지만 자동 로그인에 실패했어요. 로그인 화면으로 이동해 주세요.",
      });
      return;
    }

    router.replace("/pending");
    router.refresh();
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: "var(--color-surface-1)" }}
    >
      <main className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <Image
            src="/login-hero.png"
            alt=""
            width={280}
            height={170}
            className="mx-auto mb-6"
            priority
          />
          <p className="dt-caps mb-3">GAMECLASS</p>
          <h1 className="dt-h1 mb-2">
            {step === "identity" ? "처음 사용하시나요" : "비밀번호 설정"}
          </h1>
          <p className="dt-secondary">
            {step === "identity"
              ? "학번, 이름, 학년을 입력해 주세요"
              : `${studentId} ${name} 님 — 사용할 비밀번호를 정해 주세요`}
          </p>
        </header>

        {step === "identity" ? (
          <form onSubmit={onIdentitySubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="studentId" className="dt-caps mb-2 block">
                학번
              </label>
              <input
                id="studentId"
                type="text"
                inputMode="numeric"
                pattern="\d{7,8}"
                maxLength={8}
                placeholder="20261234"
                value={studentId}
                onChange={(e) => {
                  setStudentId(sanitizeStudentId(e.target.value));
                  if (status.kind === "error") setStatus({ kind: "idle" });
                }}
                disabled={status.kind === "loading"}
                className="dt-input"
                autoFocus
                required
              />
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
                onChange={(e) => {
                  setName(sanitizeName(e.target.value));
                  if (status.kind === "error") setStatus({ kind: "idle" });
                }}
                disabled={status.kind === "loading"}
                className="dt-input"
                required
              />
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
                      onClick={() => {
                        setGrade(g);
                        if (status.kind === "error")
                          setStatus({ kind: "idle" });
                      }}
                      disabled={status.kind === "loading"}
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

            {status.kind === "error" && (
              <p
                className="dt-secondary"
                style={{ color: "var(--color-status-miss)" }}
                role="alert"
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="dt-btn-card w-full"
            >
              {status.kind === "loading" ? "확인 중..." : "다음 →"}
            </button>

            <p className="dt-meta mt-6 text-center">
              이미 비밀번호를 만드셨나요?{" "}
              <Link href="/login" className="dt-btn-text inline">
                로그인
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={onPasswordSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="password" className="dt-caps mb-2 block">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="8자 이상, 영문+숫자"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (status.kind === "error") setStatus({ kind: "idle" });
                }}
                disabled={status.kind === "loading"}
                className="dt-input"
                autoFocus
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="dt-caps mb-2 block">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder="다시 한 번 입력"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  if (status.kind === "error") setStatus({ kind: "idle" });
                }}
                disabled={status.kind === "loading"}
                className="dt-input"
                required
                minLength={8}
              />
            </div>

            {status.kind === "error" && (
              <p
                className="dt-secondary"
                style={{ color: "var(--color-status-miss)" }}
                role="alert"
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="dt-btn-card w-full"
            >
              {status.kind === "loading" ? "가입 중..." : "가입 신청"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPassword("");
                setPasswordConfirm("");
                setStatus({ kind: "idle" });
                setStep("identity");
              }}
              className="dt-btn-text w-full text-center"
            >
              ← 이전
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
