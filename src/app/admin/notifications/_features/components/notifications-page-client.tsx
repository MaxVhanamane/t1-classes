"use client";

import { NotificationDialog } from "./notification-dialog";
import { NotificationsTable } from "./notifications-table";
import { useNotifications } from "../hooks/use-notifications";

export function NotificationsPageClient() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <NotificationDialog />
      </div>

      <NotificationsTable notifications={data ?? []} loading={isLoading} />
    </div>
  );
}
