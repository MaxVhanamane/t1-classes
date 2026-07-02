"use client";

import { NotificationDialog } from "./notification-dialog";
import { NotificationsTable } from "./notifications-table";
import { useNotifications } from "../hooks/use-notifications";
import { Button } from "@/src/components/ui/button";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { sendTestPush } from "../actions/send-test-push";

export function NotificationsPageClient() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Button
          onClick={async () => {
            console.log("ccccccccccccccccccccccc");
            const result = await callServerAction(sendTestPush());

            console.log(result);
          }}
        >
          Send Test Push
        </Button>
        <NotificationDialog />
      </div>

      <NotificationsTable notifications={data ?? []} loading={isLoading} />
    </div>
  );
}
