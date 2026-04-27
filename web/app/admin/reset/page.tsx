import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ResetForm } from "./reset-form";

export const dynamic = "force-dynamic";

export default async function AdminResetPage() {
  await requireAdmin();

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "var(--color-surface-1)" }}
    >
      <main className="mx-auto w-full max-w-md">
        <header className="mb-8">
          <Link href="/admin" className="dt-btn-text mb-3 inline-block">
            ← 관리 화면
          </Link>
          <h1 className="dt-h1 mb-1">학생 비밀번호 리셋</h1>
          <p className="dt-secondary">
            학번을 입력하고 임시 비밀번호를 설정해 주세요. 학생에게 직접 전달하면
            됩니다.
          </p>
        </header>

        <ResetForm />
      </main>
    </div>
  );
}
