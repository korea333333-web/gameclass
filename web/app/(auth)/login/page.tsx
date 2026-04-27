"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isValidStudentId,
  sanitizeStudentId,
  studentIdToEmail,
  STUDENT_ID_INVALID_ERROR,
  SIGNIN_FAILED_ERROR,
} from "@/lib/auth/student-id";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isValidStudentId(studentId)) {
      setStatus({ kind: "error", message: STUDENT_ID_INVALID_ERROR });
      return;
    }
    if (password.length === 0) {
      setStatus({ kind: "error", message: "비밀번호를 입력해 주세요" });
      return;
    }

    setStatus({ kind: "loading" });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: studentIdToEmail(studentId),
      password,
    });

    if (error) {
      // 학번 존재 여부를 노출하지 않기 위해 통합 메시지
      setStatus({ kind: "error", message: SIGNIN_FAILED_ERROR });
      return;
    }

    router.replace(fromPath);
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
          <h1 className="dt-h1 mb-2">로그인</h1>
          <p className="dt-secondary">
            광운대 정고원 게임학과 학생만 사용할 수 있습니다
          </p>
        </header>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="studentId" className="dt-caps mb-2 block">
              학번
            </label>
            <input
              id="studentId"
              type="text"
              inputMode="numeric"
              pattern="\d{7,10}"
              maxLength={10}
              autoComplete="username"
              autoFocus
              required
              placeholder="20261234"
              value={studentId}
              onChange={(e) => {
                setStudentId(sanitizeStudentId(e.target.value));
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              disabled={status.kind === "loading"}
              className="dt-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="dt-caps mb-2 block">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              disabled={status.kind === "loading"}
              className="dt-input"
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
            {status.kind === "loading" ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="dt-meta mt-8 text-center">
          처음 사용하시나요?{" "}
          <Link href="/signup" className="dt-btn-text inline">
            신규 가입
          </Link>
        </p>
        <p className="dt-meta mt-2 text-center">
          비밀번호를 잊으셨다면 학과 운영자에게 문의해 주세요
        </p>

        <hr className="dt-hairline mt-10 mb-5" />

        <p className="dt-meta text-center" style={{ color: "var(--color-ink-3)" }}>
          <Link href="/admin/login" className="dt-btn-text inline">
            관리자 로그인 →
          </Link>
        </p>
      </main>
    </div>
  );
}
