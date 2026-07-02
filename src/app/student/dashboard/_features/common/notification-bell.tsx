"use client";

import { Bell } from "lucide-react";
import { useStudentNotifications } from "../hooks/use-student-notifications";
import { Button } from "@/src/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

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

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28,
            }}
            className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] leading-none font-medium text-white"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
