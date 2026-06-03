"use client";

import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

interface EndMeetingDialogProps {
  isEndingMeeting: boolean;
  onConfirm: () => void;
}

export function EndMeetingDialog({
  isEndingMeeting,
  onConfirm,
}: EndMeetingDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 rounded-full px-3 text-[11px] font-medium shadow-lg shadow-red-500/10"
          disabled={isEndingMeeting}
        >
          {isEndingMeeting ? "Ending..." : "End Meeting"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-3xl border-white/10 bg-zinc-950">
        <AlertDialogHeader>
          <AlertDialogTitle>End Meeting?</AlertDialogTitle>

          <AlertDialogDescription>
            This will disconnect all participants and permanently end the
            mentorship session.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            End Meeting
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
