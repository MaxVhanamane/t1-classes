"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import { Loader2 } from "lucide-react";

function getHashParams() {
  const hash = window.location.hash.substring(1);
  return Object.fromEntries(new URLSearchParams(hash));
}

export default function AuthCallbackPage() {
  const supabase = createBrowserSupabaseClient();
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
      window.location.hash = "";
      // Session is now stored
      router.replace("/auth/set-password");
    }

    void handleInviteCallback();
  }, [router, supabase]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-gray-900" />
      <div className="text-center">
        <p className="text-sm font-medium">Signing you in</p>
        <p className="text-xs text-muted-foreground">
          Please wait while we verify your invitation
        </p>
      </div>
    </div>
  );
}
