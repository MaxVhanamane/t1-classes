"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MailWarning } from "lucide-react";

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
import { Button } from "@/src/components/ui/button";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { resendInvite } from "../actions/resend-invite";

export function ResendInviteAlert({
  userEmail,
  userId,
}: {
  userEmail: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dialog from closing immediately
    setIsPending(true);

    const toastId = toast.loading("Sending new password link...");

    const result = await callServerAction(resendInvite(userId));

    setIsPending(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return;
    }

    toast.success("Password setup link sent successfully!", { id: toastId });
    setOpen(false); // Close dialog only on success
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="secondary" title="Resend password link">
          Resend Link
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MailWarning className="size-5 text-amber-500" />
            Resend Password Link?
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <p>
                Password setup links are highly secure,{" "}
                <strong>one-time-use</strong> links. If the user clicks the link
                but doesn&apos;t finish creating their password, or if the link
                expires, it will permanently stop working.
              </p>
              <p>
                <strong>
                  Only send a new link if the user specifically reports an
                  &quot;invalid or expired link&quot; error.
                </strong>
              </p>
              <p>
                Sending a new email will instantly invalidate any older links
                previously sent to{" "}
                <span className="font-medium text-foreground">{userEmail}</span>
                .
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button disabled={isPending} onClick={handleResend}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Yes, send new link"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
