"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/supabase-client";

function getHashParams() {
  const hash = window.location.hash.substring(1);
  return Object.fromEntries(new URLSearchParams(hash));
}

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function handleInviteCallback() {
      const params = getHashParams();

      const access_token = params.access_token;
      const refresh_token = params.refresh_token;

      if (!access_token || !refresh_token) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        router.replace("/login");
        return;
      }

      // Session is now stored
      router.replace("/auth/set-password");
    }

    handleInviteCallback();
  }, [router, supabase]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
