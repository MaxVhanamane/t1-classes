"use client";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import dynamic from "next/dynamic";

const EnrollmentsClient = dynamic(
  () =>
    import("./_features/components/enrollments-client").then(
      (mod) => mod.EnrollmentsClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <EnrollmentsClient />
    </div>
  );
}
