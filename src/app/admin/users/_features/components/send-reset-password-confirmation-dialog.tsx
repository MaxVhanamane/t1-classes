"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MailWarning, AlertCircle, LockKeyhole } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Button } from "@/src/components/ui/button";
import { sendPasswordResetLink } from "../actions/send-password-reset-link";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface SendResetPasswordConfirmationDialogProps {
  userEmail: string;
}

export function SendResetPasswordConfirmationDialog({
  userEmail,
}: SendResetPasswordConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSendLink = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dialog from closing immediately
    setIsPending(true);

    const toastId = toast.loading("Sending password reset link...");

    const response = await callServerAction(sendPasswordResetLink(userEmail));

    setIsPending(false);

    if (response.error) {
      toast.error(response.error, { id: toastId });
      return;
    }

    toast.success(`Password reset link sent to ${userEmail}`, { id: toastId });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-muted-foreground hover:text-foreground"
              >
                <LockKeyhole className="size-4" />
                <span>Reset Password</span>
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Send Password Reset Link
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MailWarning className="size-5 text-amber-500" />
            Send Password Reset Link
          </AlertDialogTitle>

          {/* Adding asChild here fixes the hydration crash completely */}
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2 text-sm text-muted-foreground">
              <p>
                You are about to email a secure password reset link to{" "}
                <strong className="font-medium text-foreground">
                  {userEmail}
                </strong>
                .
              </p>

              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:text-amber-200">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p>
                  <strong>Important:</strong> Only send this link if the
                  student, teacher, or admin has explicitly requested to reset
                  their password.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleSendLink}
            disabled={isPending}
            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
