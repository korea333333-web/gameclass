import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server Component / Server Action / Route Handler에서 호출.
// 어드민이 아니면 /admin/login으로 리다이렉트하고 함수는 반환되지 않는다.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/admin/login");
  }

  return { user, profile };
}
