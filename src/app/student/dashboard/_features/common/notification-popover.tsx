"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useStudentNotifications } from "../hooks/use-student-notifications";
import { useMarkNotificationsSeen } from "../hooks/use-mark-seen";
import { NotificationBell } from "./notification-bell";
import { NotificationItem } from "./notification-item";

type Notification = {
  id: string;
  title: string | null;
  message: string;
  type: string;
  created_at: string;
};

function groupNotifications(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  notifications.forEach((n) => {
    const date = new Date(n.created_at);

    let key = "";

    if (date.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  return groups;
}

export function NotificationPopover() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useStudentNotifications();
  const markSeen = useMarkNotificationsSeen();

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (value && data?.unread_count) {
      markSeen.mutate(); // optimistic already
    }
  }

  const grouped = data?.notifications
    ? groupNotifications(data.notifications)
    : {};

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div>
          <NotificationBell onClick={() => setOpen(true)} />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-85 sm:w-90 p-0 bg-card mr-4">
        <div className="border-b px-4 py-3 font-medium text-foreground">
          Notifications
        </div>

        <ScrollArea className="max-h-100">
          <div>
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground">
                Loading...
              </div>
            )}

            {!isLoading && !data?.notifications.length && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}

            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {/* Group Header */}
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/40">
                  {group}
                </div>

                <div className="divide-y">
                  {items.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
