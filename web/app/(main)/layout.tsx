import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/navigation";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  // 프로필이 없는 비정상 상태 → 가입으로
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/signup");
  }

  // 어드민은 학생 영역 대신 관리 화면으로
  if (profile.role === "admin") redirect("/admin");

  // 승인되지 않은 학생은 대기 화면으로
  if (!profile.is_active) redirect("/pending");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-surface-1)" }}
    >
      <div className="md:pl-60">
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-10 md:pb-12 md:pt-16">
          {children}
        </div>
      </div>
      <Navigation />
    </div>
  );
}
