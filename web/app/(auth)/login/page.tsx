"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isValidSchoolEmail,
  EMAIL_DOMAIN_ERROR,
} from "@/lib/auth/email";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!isValidSchoolEmail(trimmed)) {
      setStatus({ kind: "error", message: EMAIL_DOMAIN_ERROR });
      return;
    }

    setStatus({ kind: "loading" });

    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }

    setStatus({ kind: "sent", email: trimmed });
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: "var(--color-surface-1)" }}
    >
      <main className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="dt-caps mb-3">GAMECLASS</p>
          <h1 className="dt-h1 mb-2">로그인</h1>
          <p className="dt-secondary">
            광운대 정고원 게임학과 학생만 사용할 수 있습니다
          </p>
        </header>

        {status.kind === "sent" ? (
          <div className="dt-card text-center">
            <p className="dt-task mb-2">메일을 보냈습니다</p>
            <p className="dt-secondary mb-1">
              <span style={{ color: "var(--color-ink-1)" }}>
                {status.email}
              </span>
            </p>
            <p className="dt-secondary">
              메일함에서 로그인 링크를 눌러 주십시오
            </p>
            <button
              type="button"
              className="dt-btn-text mt-6"
              onClick={() => setStatus({ kind: "idle" })}
            >
              다른 이메일로 다시 보내기 →
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <label className="dt-caps mb-2 block" htmlFor="email">
              학교 이메일
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="hong@kw.ac.kr"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              disabled={status.kind === "loading"}
              className="dt-input"
              aria-describedby={
                status.kind === "error" ? "email-error" : undefined
              }
              aria-invalid={status.kind === "error"}
            />

            {status.kind === "error" && (
              <p
                id="email-error"
                className="dt-secondary mt-2"
                style={{ color: "var(--color-status-miss)" }}
                role="alert"
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="dt-btn-card mt-5 w-full"
            >
              {status.kind === "loading"
                ? "보내는 중..."
                : "로그인 링크 받기"}
            </button>

            <p className="dt-meta mt-6 text-center">
              가입 절차는 별도로 없습니다
            </p>
            <p className="dt-meta mt-1 text-center">
              학교 이메일로 로그인 링크가 전송됩니다
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
