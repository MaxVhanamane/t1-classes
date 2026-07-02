"use client";

import { useRegisterPush } from "@/src/hooks/student/notifications/use-register-push";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function PushRegistration() {
  const queryClient = useQueryClient();
  useRegisterPush();
  useEffect(() => {
    if (!navigator.serviceWorker) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "notification-clicked") {
        void queryClient.invalidateQueries({
          queryKey: ["student-notifications"],
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, [queryClient]);
  return null;
}
