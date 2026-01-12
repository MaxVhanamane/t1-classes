"use client";

import { useState, useCallback } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/src/lib/supabase/supabase-client";
import Image from "next/image";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { StatusCard } from "@/src/components/ui/common/StatusCard";

export default function LoginPage() {
  const supabase = createClient();
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || "Invalid email or password.");
          setLoading(false);
          return;
        }

        setRedirecting(true);
        router.replace("/");
      } catch {
        toast.error("Something went wrong. Please try again.");
        setLoading(false);
      }
    },
    [email, password, router, supabase]
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
        <div className="max-w-md space-y-6">
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
              "Structured practice",
              "Exam-focused learning",
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
              src="/school.svg"
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
        <div className="w-full max-w-sm rounded-2xl bg-card text-card-foreground shadow-md border border-border">
          {/* Mobile illustration */}
          <div className="flex justify-center rounded-t-2xl bg-muted py-6 md:hidden">
            <Image
              src="/school.svg"
              alt="Learning illustration"
              width={160}
              height={160}
              priority
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-7 px-8 py-10">
            <div className="space-y-2 text-center">
              <h2 className="text-[22px] font-medium">Sign in to continue</h2>
              <p className="text-sm text-muted-foreground">
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
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-muted-foreground hover:text-foreground
                    transition
                    disabled:opacity-50
                  "
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button className="h-11 w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Secure access for students and administrators
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
