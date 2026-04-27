"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 15000;

export function PendingPoller() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      void checkOnce();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkOnce() {
    setChecking(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_active) {
      router.replace("/");
      router.refresh();
      return;
    }
    setChecking(false);
  }

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void checkOnce()}
        disabled={checking}
        className="dt-btn-card w-full"
      >
        {checking ? "확인 중..." : "지금 확인"}
      </button>
      <button
        type="button"
        onClick={onSignOut}
        className="dt-btn-text mx-auto block"
      >
        로그아웃
      </button>
    </div>
  );
}
