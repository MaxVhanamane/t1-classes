// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { toast } from "sonner";
// import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

// // Supabase
// import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";

// // Shadcn UI Components
// import { Input } from "@/src/components/ui/input";
// import { Button } from "@/src/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
// } from "@/src/components/ui/form";
// import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

// /* -------------------------------------------------------------------------- */
// /* Zod Schema (Strict Password Rules)                                         */
// /* -------------------------------------------------------------------------- */
// const setPasswordSchema = z
//   .object({
//     password: z
//       .string()
//       .min(8, { message: "Password must be at least 8 characters long." })
//       .regex(/[A-Z]/, {
//         message: "Password must contain at least one uppercase letter.",
//       })
//       .regex(/[a-z]/, {
//         message: "Password must contain at least one lowercase letter.",
//       })
//       .regex(/[0-9]/, { message: "Password must contain at least one number." })
//       .regex(/[^A-Za-z0-9]/, {
//         message: "Password must contain at least one special character.",
//       }),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match.",
//     path: ["confirmPassword"],
//   });

// type SetPasswordInput = z.infer<typeof setPasswordSchema>;

// /* -------------------------------------------------------------------------- */
// /* Component                                                                  */
// /* -------------------------------------------------------------------------- */
// export default function SetPasswordPage() {
//   const supabase = createBrowserSupabaseClient();
//   const router = useRouter();

//   const [showPassword, setShowPassword] = useState(false);
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   const form = useForm<SetPasswordInput>({
//     resolver: zodResolver(setPasswordSchema),
//     defaultValues: {
//       password: "",
//       confirmPassword: "",
//     },
//     mode: "onSubmit",
//   });

//   const { isSubmitting } = form.formState;

//   // Protect page: Must have a valid session to set the password
//   useEffect(() => {
//     let isMounted = true;

//     async function checkAuth() {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!isMounted) return;

//       if (!user) {
//         toast.error(
//           "Your invite link has expired or is invalid. Please request a new one.",
//         );
//         router.replace("/login");
//         return;
//       }

//       setCheckingAuth(false);
//     }

//     void checkAuth();

//     return () => {
//       isMounted = false;
//     };
//   }, [router, supabase]);

//   const onSubmit = form.handleSubmit(
//     // 1. Success Callback (Valid Schema)
//     async (values: SetPasswordInput) => {
//       const toastId = toast.loading("Securing your account...");

//       try {
//         // Step 1: Set the password in Supabase Auth
//         const { error: passwordError } = await supabase.auth.updateUser({
//           password: values.password,
//         });

//         if (passwordError) throw passwordError;

//         // Step 2: Activate user via your custom server endpoint
//         const res = await fetch("/api/auth/user-status/activate", {
//           method: "POST",
//         });

//         if (!res.ok) {
//           throw new Error(
//             "Password saved, but account activation failed. Please contact support.",
//           );
//         }

//         // Step 3: Success!
//         toast.success("Password set successfully! Welcome aboard.", {
//           id: toastId,
//         });
//         router.replace("/");
//       } catch (error) {
//         toast.error(
//           error instanceof Error ? error.message : "Failed to set password",
//           {
//             id: toastId,
//           },
//         );
//       }
//     },
//     // 2. Error Callback (Invalid Schema from Zod)
//     (errors) => {
//       const message = extractFirstErrorMessage(errors);
//       toast.error(message || "Please check your password requirements.");
//     },
//   );

//   /* -------------------------------------------------------------------------- */
//   /* Loading State                                                              */
//   /* -------------------------------------------------------------------------- */
//   if (checkingAuth) {
//     return (
//       <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
//         <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
//           <Loader2
//             className="size-7 animate-spin text-primary"
//             strokeWidth={2.5}
//           />
//         </div>
//         <div className="text-center space-y-1.5">
//           <h2 className="text-lg font-semibold tracking-tight text-foreground">
//             Verifying Access
//           </h2>
//           <p className="text-sm text-muted-foreground">
//             Checking your secure session...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* -------------------------------------------------------------------------- */
//   /* Main Form UI                                                               */
//   /* -------------------------------------------------------------------------- */
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background px-4">
//       <div className="w-full max-w-md rounded-lg bg-background/60 backdrop-blur-xl border border-border/60 p-8 shadow-2xl shadow-black/5 relative overflow-hidden">
//         {/* Subtle top glow */}
//         <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/10 to-transparent" />

//         <div className="relative z-10 flex flex-col items-center mb-8 space-y-4">
//           <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
//             <ShieldCheck className="size-7" />
//           </div>
//           <div className="text-center space-y-1.5">
//             <h1 className="text-2xl font-bold tracking-tight text-foreground">
//               Secure Your Account
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               Create a strong password to complete your setup.
//             </p>
//           </div>
//         </div>

//         <Form {...form}>
//           <form onSubmit={onSubmit} className="relative z-10 space-y-6">
//             <div className="space-y-4">
//               {/* New Password Field */}
//               <div className="space-y-3">
//                 <FormField
//                   control={form.control}
//                   name="password"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         <div className="relative">
//                           <Input
//                             {...field}
//                             type={showPassword ? "text" : "password"}
//                             placeholder="New password"
//                             disabled={isSubmitting}
//                             className="h-11 pr-10 shadow-none rounded-lg bg-background/70 backdrop-blur border-border focus-visible:ring-2 focus-visible:ring-gray-400/40"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowPassword((prev) => !prev)}
//                             disabled={isSubmitting}
//                             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
//                           >
//                             {showPassword ? (
//                               <EyeOff size={18} />
//                             ) : (
//                               <Eye size={18} />
//                             )}
//                           </button>
//                         </div>
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />

//                 {/* Password Requirements Guide */}
//                 <div className="px-1 space-y-1.5">
//                   <p className="text-xs font-medium text-foreground">
//                     Password requirements:
//                   </p>
//                   <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
//                     <li>Minimum 8 characters</li>
//                     <li>At least one uppercase & lowercase letter</li>
//                     <li>At least one number & special character</li>
//                   </ul>
//                 </div>
//               </div>

//               {/* Confirm Password Field */}
//               <FormField
//                 control={form.control}
//                 name="confirmPassword"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Confirm password"
//                         disabled={isSubmitting}
//                         className="h-11 shadow-none rounded-lg bg-background/70 backdrop-blur border-border focus-visible:ring-2 focus-visible:ring-gray-400/40"
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <Button
//               type="submit"
//               className="h-11 w-full rounded-lg text-base"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 "Set Password"
//               )}
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }
