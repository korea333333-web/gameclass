import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PendingPoller } from "./pending-poller";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, is_active, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/signup");
  if (profile.role === "admin") redirect("/admin");
  if (profile.is_active) redirect("/");

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{ background: "var(--color-surface-1)" }}
    >
      <main className="w-full max-w-sm text-center">
        <Image
          src="/login-hero.png"
          alt=""
          width={280}
          height={170}
          className="mx-auto mb-6"
          priority
        />
        <p className="dt-caps mb-3">GAMECLASS</p>
        <h1 className="dt-h1 mb-3">승인 대기 중</h1>
        <p className="dt-secondary mb-2">
          {profile.name}님, 가입이 신청되었습니다
        </p>
        <p className="dt-secondary mb-8">
          학과 운영자가 본인 확인 후 승인하면 자동으로 들어갑니다
        </p>

        <PendingPoller />

        <p className="dt-meta mt-8">
          승인이 늦어지면 학과 운영자에게 문의해 주세요
        </p>
      </main>
    </div>
  );
}
