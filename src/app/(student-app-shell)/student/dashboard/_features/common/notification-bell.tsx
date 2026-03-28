"use client";

import { Bell } from "lucide-react";
import { useStudentNotifications } from "../hooks/use-student-notifications";
import { Button } from "@/src/components/ui/button";

export function NotificationBell({ onClick }: { onClick: () => void }) {
  const { data } = useStudentNotifications();

  const count = data?.unread_count ?? 0;

  const label = count > 99 ? "99+" : count;

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
    >
      <Bell className="h-5 w-5" />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
          {label}
        </span>
      )}
    </Button>
  );
}
