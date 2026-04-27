"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPageInner />
    </Suspense>
  );
}

function AdminLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setStatus({ kind: "error", message: "이메일과 비밀번호를 입력해 주세요" });
      return;
    }

    setStatus({ kind: "loading" });
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setStatus({
        kind: "error",
        message: "이메일 또는 비밀번호가 일치하지 않습니다",
      });
      return;
    }

    // 어드민 권한 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setStatus({
        kind: "error",
        message: "어드민 권한이 없는 계정입니다",
      });
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
          <p className="dt-caps mb-3">GAMECLASS · ADMIN</p>
          <h1 className="dt-h1 mb-2">관리자 로그인</h1>
          <p className="dt-secondary">학과 운영자 전용 통로입니다</p>
        </header>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="dt-caps mb-2 block">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
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
            {status.kind === "loading" ? "로그인 중..." : "관리자 로그인"}
          </button>
        </form>
      </main>
    </div>
  );
}
