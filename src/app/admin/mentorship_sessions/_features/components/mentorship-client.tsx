"use client";

import dynamic from "next/dynamic";

const MentorshipPageHeader = dynamic(
  () =>
    import("./mentorship-page-header").then((mod) => mod.MentorshipPageHeader),
  {
    ssr: false,
  },
);

const MentorshipSessionsTable = dynamic(
  () =>
    import("./mentorship-sessions-table").then(
      (mod) => mod.MentorshipSessionsTable,
    ),
  {
    ssr: false,
  },
);

interface MentorshipClientProps {
  isAdmin: boolean;
  mentorshipSessionsEnabled: boolean;
}

export function MentorshipClient({
  isAdmin,
  mentorshipSessionsEnabled,
}: MentorshipClientProps) {
  return (
    <>
      <MentorshipPageHeader
        isAdmin={isAdmin}
        mentorshipSessionsEnabled={mentorshipSessionsEnabled}
      />

      <MentorshipSessionsTable />
    </>
  );
}
