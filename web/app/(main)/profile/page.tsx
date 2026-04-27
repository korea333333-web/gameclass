import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.student_id || !profile.name) {
    // 가입 흐름이 어딘가에서 끊긴 비정상 상태 — 로그아웃 후 가입 화면으로
    await supabase.auth.signOut();
    redirect("/signup");
  }

  return (
    <main>
      <header className="mb-8">
        <p className="dt-caps mb-2">PROFILE</p>
        <h1 className="dt-h1">프로필</h1>
      </header>

      <ProfileForm
        initialValues={{
          studentId: profile.student_id,
          name: profile.name,
        }}
      />
    </main>
  );
}
