"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/src/components/ui/form";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";
import DottedBackground from "@/src/components/dotted-background";
import { ServerActionResponse } from "@/src/types/server-action";
import { callServerAction } from "@/src/lib/actions/call-server-action";

/* -------------------------------------------------------------------------- */
/* Zod Schema (Strict Password Rules)                                         */
/* -------------------------------------------------------------------------- */
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[A-Z]/, { message: "Must contain an uppercase letter." })
      .regex(/[a-z]/, { message: "Must contain a lowercase letter." })
      .regex(/[0-9]/, { message: "Must contain a number." })
      .regex(/[^A-Za-z0-9]/, { message: "Must contain a special character." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type PasswordInput = z.infer<typeof passwordSchema>;

/* -------------------------------------------------------------------------- */
/* Props Interface                                                            */
/* -------------------------------------------------------------------------- */
interface SecurePasswordFormProps {
  title: string;
  description: string;
  loadingText: string;
  buttonText: string;
  successMessage: string;
  // The specific server action to run (Invite Setup vs. Password Reset)
  onSubmitAction: (
    password: string,
    accessToken: string,
  ) => Promise<ServerActionResponse>;
}

export function SecurePasswordForm({
  title,
  description,
  loadingText,
  buttonText,
  successMessage,
  onSubmitAction,
}: SecurePasswordFormProps) {
  const router = useRouter();

  const [verifying, setVerifying] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  const { isSubmitting } = form.formState;
  const currentPassword = form.watch("password") || "";

  const passwordRequirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "Uppercase letter" },
    { regex: /[a-z]/, text: "Lowercase letter" },
    { regex: /[0-9]/, text: "Number" },
    { regex: /[^A-Za-z0-9]/, text: "Special character" },
  ];

  /* Extract Token on Mount */
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    if (token) {
      setAccessToken(token);
      window.history.replaceState(null, "", window.location.pathname);
      setVerifying(false);
    } else {
      toast.error("Invalid or expired link. Please request a new one.");
      router.replace("/login");
    }
  }, [router]);

  /* Handle Submit */
  const onSubmit = form.handleSubmit(
    async (values: PasswordInput) => {
      if (!accessToken) return;

      const toastId = toast.loading("Securing your account...");

      try {
        const result = await callServerAction(
          onSubmitAction(values.password, accessToken),
        );

        if (result.error) throw new Error(result.error);

        toast.success(successMessage, { id: toastId });
        router.replace("/login");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to process request",
          { id: toastId },
        );
      }
    },
    (errors) => {
      const message = extractFirstErrorMessage(errors);
      toast.error(message || "Please check your password requirements.");
    },
  );

  if (verifying) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Loader2
            className="size-7 animate-spin text-primary"
            strokeWidth={2.5}
          />
        </div>
        <div className="space-y-1.5 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {loadingText}
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparing your secure environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border/60 bg-background/60 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
        <DottedBackground className="opacity-60 dark:hidden" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/5 to-transparent dark:hidden" />

        <div className="relative z-10 mb-8 flex flex-col items-center space-y-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck className="size-7" />
          </div>
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="relative z-10 space-y-6">
            <div className="space-y-4">
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
                          placeholder="New password"
                          disabled={isSubmitting}
                          className="h-11 rounded-xl border-border bg-background/70 pr-10 shadow-none backdrop-blur"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          disabled={isSubmitting}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border-border bg-background/70 shadow-none backdrop-blur"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="mb-3 text-xs font-medium text-foreground">
                Password requirements:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {passwordRequirements.map((req) => {
                  const isMet = req.regex.test(currentPassword);
                  return (
                    <div
                      key={req.text}
                      className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                        isMet ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {isMet ? (
                        <CheckCircle2 className="size-3.5 text-green-500" />
                      ) : (
                        <Circle className="size-3.5 opacity-40" />
                      )}
                      <span>{req.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
