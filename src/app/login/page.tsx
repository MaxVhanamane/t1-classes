"use client";

import { useState, useCallback } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/src/lib/supabase/supabase-client";
import Image from "next/image";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

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
        router.replace("/admin");
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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-white px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
              <Loader2 className="h-6 w-6 animate-spin text-black" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900">
              Getting things ready
            </h2>
            <p className="text-sm text-gray-500">Setting up your dashboard</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Login successful
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Main Layout ---------------- */
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-linear-to-br from-gray-50 to-white 2xl:px-10">
      {/* ---------------- Left: Value / Context ---------------- */}
      <div className="hidden md:flex flex-col justify-center px-14 lg:px-20">
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            Strong concepts.
            <br /> Better exam results.
          </h1>
          {/* <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            Concept-driven learning.
            <br /> Exam-ready preparation.
          </h1> */}

          <p className="text-gray-600 text-base leading-relaxed">
            Learn concepts the right way. Study with videos, practice sets, and
            real exam questions that show where theory is actually applied.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Concept to application
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Previous year questions
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Structured practice
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Exam-focused learning
            </div>
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
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-md">
          {/* Mobile illustration */}
          <div className="flex justify-center rounded-t-2xl bg-gray-50 py-6 md:hidden">
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
              <h2 className="text-[22px] font-medium text-gray-900">
                Sign in to continue
              </h2>
              <p className="text-sm text-gray-500">
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
                    text-gray-400 hover:text-gray-700
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

            <Button className="h-11 w-full cursor-pointer" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Secure access for students and administrators
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
