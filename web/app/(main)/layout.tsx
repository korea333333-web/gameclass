import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
