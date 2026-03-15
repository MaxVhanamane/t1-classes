"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";

export default function SetPasswordPage() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Protect page: must be authenticated
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    }

    void checkAuth();
  }, [router, supabase]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    // 1 Set password
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
      setError(passwordError.message);
      setLoading(false);
      return;
    }

    // 2 Activate user (server-controlled, RLS-safe)
    const res = await fetch("/api/auth/user-status/activate", {
      method: "POST",
    });

    if (!res.ok) {
      setError(
        "Password was set, but account activation failed. Please contact support.",
      );
      setLoading(false);
      return;
    }

    // 3 Success → enter app
    router.replace("/");
  }

  //  Auth check loading
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSetPassword}
        className="w-full max-w-sm space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-lg font-semibold text-center">Set your password</h1>

        {/* New password */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-2.5 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm password */}
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          className="w-full cursor-pointer"
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? "Saving…" : "Set Password"}
        </Button>
      </form>
    </div>
  );
}
