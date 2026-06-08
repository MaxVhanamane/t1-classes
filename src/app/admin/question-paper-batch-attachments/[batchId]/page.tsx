"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

import { useParams } from "next/navigation";

const BatchAttachmentPage = dynamic(
  () =>
    import("./_features/components/batch-attanchment-page").then(
      (mod) => mod.BatchAttachmentPage,
    ),
  {
    ssr: false,
    loading: () => (
      <CenteredLoader message="Preparing attachment management..." />
    ),
  },
);

export default function Page() {
  const params = useParams<{
    batchId: string;
  }>();

  return <BatchAttachmentPage batchId={params.batchId} />;
}
