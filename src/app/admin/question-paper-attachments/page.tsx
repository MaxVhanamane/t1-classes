"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const AttachmentPage = dynamic(
  () =>
    import("./_features/components/attachment-page").then(
      (mod) => mod.AttachmentPage,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader message="Loading attachments..." />,
  },
);

export default function Page() {
  return <AttachmentPage />;
}
