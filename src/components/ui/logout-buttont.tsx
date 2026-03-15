"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ROUTES } from "@/src/lib/constants/route-constants";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";

export function LogoutButton() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    await supabase.auth.signOut();

    // IMPORTANT:
    // push instead of redirect to avoid server mismatch
    router.push(ROUTES.login);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-sm text-destructive"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  );
}
