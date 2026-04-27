"use client";

import { useState, type FormEvent } from "react";
import {
  isValidStudentId,
  sanitizeStudentId,
  validatePassword,
} from "@/lib/auth/student-id";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; studentId: string }
  | { kind: "error"; message: string };

export function ResetForm() {
  const [studentId, setStudentId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidStudentId(studentId)) {
      setStatus({ kind: "error", message: "학번은 7~8자리 숫자여야 합니다" });
      return;
    }
    const pwError = validatePassword(newPassword);
    if (pwError) {
      setStatus({ kind: "error", message: pwError });
      return;
    }

    setStatus({ kind: "loading" });
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: studentId.trim(), newPassword }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      setStatus({ kind: "error", message: json.error || "리셋에 실패했습니다" });
      return;
    }

    setStatus({ kind: "ok", studentId: studentId.trim() });
    setNewPassword("");
  }

  return (
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
          placeholder="20261234"
          value={studentId}
          onChange={(e) => {
            setStudentId(sanitizeStudentId(e.target.value));
            if (status.kind !== "loading") setStatus({ kind: "idle" });
          }}
          disabled={status.kind === "loading"}
          className="dt-input"
          autoFocus
          required
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="dt-caps mb-2 block">
          새 비밀번호 (임시)
        </label>
        <input
          id="newPassword"
          type="text"
          autoComplete="off"
          placeholder="8자 이상, 영문+숫자"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (status.kind !== "loading") setStatus({ kind: "idle" });
          }}
          disabled={status.kind === "loading"}
          className="dt-input"
          required
          minLength={8}
        />
        <p className="dt-meta mt-2">
          학생에게 전달할 임시 비밀번호입니다. 화면에 그대로 표시되니 옆에 사람이
          없는지 확인하세요.
        </p>
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

      {status.kind === "ok" && (
        <p className="dt-secondary" role="status">
          {status.studentId} 학생의 비밀번호를 새로 설정했습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "loading"}
        className="dt-btn-card w-full"
      >
        {status.kind === "loading" ? "리셋 중..." : "비밀번호 리셋"}
      </button>
    </form>
  );
}
