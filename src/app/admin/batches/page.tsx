"use client";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import dynamic from "next/dynamic";

const BatchesClient = dynamic(
  () =>
    import("./_features/components/batches-client-wrapper").then(
      (mod) => mod.BatchesClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function AdminBatchesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <BatchesClient />
    </div>
  );
}
