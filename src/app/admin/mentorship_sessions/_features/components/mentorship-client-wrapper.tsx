"use client";

import dynamic from "next/dynamic";

const MentorshipClient = dynamic(
  () =>
    import("./mentorship-client").then((mod) => ({
      default: mod.MentorshipClient,
    })),
  {
    ssr: false,
  },
);

interface MentorshipClientWrapperProps {
  isAdmin: boolean;
  mentorshipSessionsEnabled: boolean;
  currentUserId: string;
}

export function MentorshipClientWrapper(props: MentorshipClientWrapperProps) {
  return <MentorshipClient {...props} />;
}
