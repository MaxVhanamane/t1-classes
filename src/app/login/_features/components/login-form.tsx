"use client";

import { useState, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

// Supabase
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";

// Shadcn UI Components
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/src/components/ui/form";
import { StatusCard } from "@/src/components/ui/common/StatusCard";
import { LoginInput, loginSchema } from "../zod/login.schema";
import { Link } from "@/src/components/ui/link";

export default function LoginForm() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const { isSubmitting } = form.formState;

  useLayoutEffect(() => {
    return () => {
      setRedirecting(false);
      setShowPassword(false);
      form.reset();
    };
  }, [form]);

  const onSubmit = form.handleSubmit(
    async (values: LoginInput) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        // If the backend returned a rate limit error, data.error contains the 5-minute text
        if (!res.ok) throw new Error(data?.error || "Login failed");
        if (!data.access_token || !data.refresh_token)
          throw new Error("Invalid server response");

        const { error } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (error)
          throw new Error(error.message || "Failed to establish session");

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
        toast.error(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      if (firstError && firstError.message) {
        toast.error(firstError.message as string);
      } else {
        toast.error("Please fill in all required fields correctly.");
      }
    },
  );

  if (redirecting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background backdrop-blur-sm z-50">
        <StatusCard
          title="Getting things ready"
          description="Setting up your dashboard"
          icon={
            <Loader2 className="h-6 w-6 animate-spin dark:text-foreground text-white" />
          }
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
    <Form {...form}>
      <form
        onSubmit={onSubmit}
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

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email address"
                    disabled={isSubmitting}
                    autoComplete="email"
                    className="h-10 rounded-md shadow-none bg-background/70 backdrop-blur border-border focus-visible:ring-2 focus-visible:ring-gray-400/40"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      disabled={isSubmitting}
                      autoComplete="current-password"
                      className="h-10 pr-10 shadow-none rounded-md bg-background/70 backdrop-blur border-border focus-visible:ring-2 focus-visible:ring-gray-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full z-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <div className="flex justify-end pt-1">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </Form>
  );
}
