"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const GroupSessionsPageClient = dynamic(
  () =>
    import("./_features/components/group-sessions-page-client").then(
      (mod) => mod.GroupSessionsPageClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function GroupSessionsPage() {
  return <GroupSessionsPageClient />;
}
