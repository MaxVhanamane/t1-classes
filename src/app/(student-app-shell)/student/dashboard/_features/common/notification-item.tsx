"use client";

import { useState } from "react";
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

type Props = {
  notification: {
    title: string | null;
    message: string;
    type: string;
    created_at: string;
  };
};

function getIcon(type: string) {
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
  const now = new Date();
  const time = new Date(dateStr);

  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  return time.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function NotificationItem({ notification }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* LIST ITEM */}
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left flex gap-3 p-3 hover:bg-muted/50 transition"
      >
        <div className="mt-1 text-muted-foreground">
          {getIcon(notification.type)}
        </div>

        <div className="flex-1 space-y-1">
          {notification.title && (
            <p className="text-sm font-medium line-clamp-1 text-foreground">
              {notification.title}
            </p>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>

          <p className="text-[10px] text-muted-foreground">
            {getTimeLabel(notification.created_at)}
          </p>
        </div>
      </button>

      {/* FULL VIEW DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{notification.title ?? "Notification"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {notification.message}
            </p>

            <p className="text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
