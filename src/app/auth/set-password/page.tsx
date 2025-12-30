"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/supabase-client";

export default function SetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSetPassword}
        className="w-full max-w-sm space-y-4 border rounded-lg p-6"
      >
        <h1 className="text-lg font-semibold text-center">Set your password</h1>

        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Set Password"}
        </Button>
      </form>
    </div>
  );
}
