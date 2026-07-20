"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Megaphone,
  FileText,
  AlertCircle,
  Settings,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import DottedBackground from "@/src/components/dotted-background";

type Props = {
  notification: {
    title: string | null;
    message: string;
    type: string;
    created_at: string;
  };
};

export function getNotificationIcon(type: string) {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-4 w-4 text-blue-500" />;

    case "test":
      return <FileText className="h-4 w-4 text-purple-500" />;

    case "reminder":
      return <Bell className="h-4 w-4 text-yellow-500" />;

    case "system":
      return <Settings className="h-4 w-4 text-gray-500" />;

    case "batch":
      return <Users className="h-4 w-4 text-green-500" />;

    default:
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
}

function getTimeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function NotificationItem({ notification }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Push a unique state to the browser history when dialog opens
    const stateId = Math.random().toString();
    window.history.pushState({ dialog: stateId }, "");

    // Listen for the browser back button (popstate)
    const handlePopState = () => {
      setOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      // If the dialog is closed via "X" or clicking outside, the back button state is still in history.
      // We check if our stateId is still there, and if so, we silently pop it so the history remains clean.
      if (window.history.state?.dialog === stateId) {
        window.history.back();
      }
    };
  }, [open]);

  return (
    <>
      {/* LIST ITEM */}
      <button
        onClick={() => setOpen(true)}
        // THE FIX: Swapped "flex" for "grid grid-cols-[auto_1fr]".
        // Added "max-w-full" so the button can never push outside its parent.
        className="w-full max-w-full text-left grid grid-cols-[auto_1fr] gap-3 p-3 hover:bg-muted/50 transition"
      >
        {/* No shrink-0 needed anymore, the "auto" grid column handles it natively */}
        <div className="mt-1 text-muted-foreground">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Removed the extra overflow-hidden that was causing the sharp visual cut */}
        <div className="min-w-0 space-y-1">
          {notification.title && (
            <p className="text-sm font-medium truncate text-foreground">
              {notification.title}
            </p>
          )}

          {/* Cleaned up extra classes. line-clamp-2 works perfectly inside a min-w-0 grid child */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>

          <p className="text-[10px] text-muted-foreground truncate">
            {getTimeLabel(notification.created_at)}
          </p>
        </div>
      </button>

      {/* FULL VIEW DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[calc(100%-2rem)] max-w-md rounded-xl border-border/60 p-6 pt-8 bg-inverse sm:w-full"
        >
          <div className="absolute inset-0 -z-50">
            <DottedBackground />
          </div>
          {/* 
            THE FIX: 
            - flex-col + items-center stacks the icon and title perfectly in the center.
            - text-center sm:text-center overrides default left-alignment.
          */}
          <DialogHeader className="flex flex-col items-center space-y-4 text-center sm:text-center z-50">
            {/* Slightly larger icon container for top-center placement */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted/50 [&>svg]:h-7 [&>svg]:w-7">
              {getNotificationIcon(notification.type)}
            </div>

            {/* px-4 ensures a massive title doesn't clip the absolute close (X) button */}
            <DialogTitle className="w-full px-4 text-lg font-semibold leading-snug tracking-tight text-foreground break-words">
              {notification.title ?? "Notification"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 flex flex-col items-center space-y-5 text-center z-50">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground break-words px-2">
              {notification.message}
            </p>

            <div className="w-full border-t border-border/40 pt-4">
              <p className="text-xs font-medium text-muted-foreground/70">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
