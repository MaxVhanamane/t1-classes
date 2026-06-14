"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const NotificationsPageClient = dynamic(
  () =>
    import("./_features/components/notifications-page-client").then(
      (mod) => mod.NotificationsPageClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function AdminNotificationsPage() {
  return <NotificationsPageClient />;
}
