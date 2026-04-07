"use client";

import { useState, useCallback } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import Image from "next/image";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { StatusCard } from "@/src/components/ui/common/StatusCard";
import { GridBackground } from "@/src/components/grid-background";
import { AnimatedLogo } from "../student/dashboard/_features/common/animated-logo";

export default function LoginPage() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
    );
  }

  /* ---------------- Main Layout ---------------- */
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background 2xl:px-10">
      {/* ---------------- Left ---------------- */}

      <div className="hidden md:flex flex-col justify-center px-14 lg:px-20">
        <div className="max-w-md space-y-6 pt-4">
          <h1 className="text-3xl font-semibold text-foreground leading-tight">
            Strong concepts.
            <br /> Better exam results.
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed">
            Learn concepts the right way. Study with videos, practice sets, and
            real exam questions that show where theory is actually applied.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {[
              "Concept to application",
              "Previous year questions",
              "Exam-focused learning",
              "Structured practice",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>

          <div className="pt-8">
            <Image
              src={
                process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL +
                "/assets/school.svg"
              }
              alt="Learning illustration"
              width={350}
              height={350}
              priority
            />
          </div>
        </div>
      </div>

      {/* ---------------- Right: Login Card ---------------- */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl text-card-foreground bg-background shadow-md border border-border relative z-10 overflow-hidden">
          {/* Top glow */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 
      bg-linear-to-b from-gray-400/15 via-gray-400/5 to-transparent 
      dark:from-gray-300/50 dark:via-gray-300/5 blur-2xl rounded-2xl"
          />

          {/* Border glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset 
      ring-gray-400/10 dark:ring-gray-300/15"
          />

          <GridBackground className="rounded-2xl opacity-40" />

          <div className="flex flex-col items-center pt-10 pb-2 space-y-2 z-10 relative">
            <div className="w-15 h-15">
              <AnimatedLogo />
            </div>
          </div>

          {/* FORM */}
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

            <Button
              type="submit"
              className="h-11 w-full z-10 "
              disabled={loading}
            >
              {" "}
              {loading ? "Signing in…" : "Sign in"}{" "}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-1">
              Secure access for students and administrators
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

{
  /* Mobile illustration */
}
{
  /* <div className="flex justify-center rounded-t-2xl bg-muted  md:hidden">
            <Image
              src={
                process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL +
                "/assets/school.svg"
              }
              alt="Learning illustration"
              width={200}
              height={200}
              priority
              className="mt-2"
            />
          </div> */
}
