import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("student_id, name, grade")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main>
      <header className="mb-8">
        <p className="dt-caps mb-2">PROFILE</p>
        <h1 className="dt-h1">{profile ? "프로필" : "프로필 작성"}</h1>
        <p className="dt-secondary mt-1">{user.email}</p>
      </header>

      <ProfileForm
        initialValues={
          profile
            ? {
                studentId: profile.student_id,
                name: profile.name,
                grade: profile.grade,
              }
            : null
        }
      />
    </main>
  );
}
