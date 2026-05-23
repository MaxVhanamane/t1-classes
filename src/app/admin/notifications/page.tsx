"use client";

import { NotificationDialog } from "./_features/components/notification-dialog";
import { NotificationsTable } from "./_features/components/notifications-table";
import { useNotifications } from "./_features/hooks/use-notifications";

export default function AdminNotificationsPage() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="space-y-6 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <NotificationDialog />
      </div>

      <NotificationsTable notifications={data ?? []} loading={isLoading} />
    </div>
  );
}
