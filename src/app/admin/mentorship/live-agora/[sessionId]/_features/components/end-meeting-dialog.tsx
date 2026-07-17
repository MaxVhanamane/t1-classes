"use client";

import { PhoneOff } from "lucide-react";
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
          variant="ghost"
          size="sm"
          className="h-8 rounded-full text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <PhoneOff className="mr-1.5 size-3.5" />
          End
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>End Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Ending the session will disconnect all participants and permanently
            close the mentorship room.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isEndingMeeting}
            onClick={onConfirm}
          >
            {isEndingMeeting ? "Ending..." : "End Session"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
