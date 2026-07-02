"use client";

import { useRegisterPush } from "@/src/hooks/student/notifications/use-register-push";
import { startPushListener } from "@/src/lib/firebase/listen-for-push";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { getNotificationIcon } from "../../dashboard/_features/common/notification-item";

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

  useEffect(() => {
    let mounted = true;

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const stopListening = await startPushListener((data) => {
        void queryClient.invalidateQueries({
          queryKey: ["student-notifications"],
        });

        toast(data.title ?? "Notification", {
          description: data.body,
          icon: getNotificationIcon(data.type),
          duration: 5000,
        });
      });

      if (mounted) {
        unsubscribe = stopListening;
      } else {
        stopListening();
      }
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [queryClient]);

  return null;
}
