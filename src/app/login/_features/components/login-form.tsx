"use client";

import { useState, useCallback, useLayoutEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { StatusCard } from "@/src/components/ui/common/StatusCard";

export default function LoginForm() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useLayoutEffect(() => {
    return () => {
      setRedirecting(false);
      setEmail("");
      setPassword("");
      setShowPassword(false);
    };
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!email || !password) {
        toast.error("Email and password are required.");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Login failed");
        }

        if (!data.access_token || !data.refresh_token) {
          throw new Error("Invalid server response");
        }

        // store session inside Supabase client
        const { error } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (error) {
          throw new Error(error.message || "Failed to establish session");
        }

        const { data: authData } = await supabase.auth.getClaims();
        const role = authData?.claims?.app_role;
        setRedirecting(true);

        switch (role) {
          case "admin":
          case "teacher":
            router.replace("/admin");
            break;
          case "student":
            router.replace("/student/dashboard");
            break;
          default:
            router.replace("/");
        }
      } catch (err) {
        console.error("Login error:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, router, supabase],
  );

  /* ---------------- Redirect Screen ---------------- */
  if (redirecting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background backdrop-blur-sm z-50">
        <StatusCard
          title="Getting things ready"
          description="Setting up your dashboard"
          icon={<Loader2 className="h-6 w-6 animate-spin text-foreground" />}
          footer={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Login successful
            </div>
          }
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-6 px-8 pb-8 pt-4 relative z-10"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Sign in to continue
        </h2>
        <p className="text-sm text-muted-foreground/80">
          Your personalized learning dashboard awaits
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
          required
          className="h-10 rounded-md bg-background/70 backdrop-blur border-white/10 focus-visible:ring-2 focus-visible:ring-gray-400/40"
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
            className="h-10 pr-10 rounded-md bg-background/70 backdrop-blur border-white/10 focus-visible:ring-2 focus-visible:ring-gray-400/40"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="h-11 w-full z-10 " disabled={loading}>
        {" "}
        {loading ? "Signing in…" : "Sign in"}{" "}
      </Button>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Secure access for students and administrators
      </p>
    </form>
  );
}
