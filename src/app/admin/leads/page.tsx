"use client";

import dynamic from "next/dynamic";
import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const LeadsClient = dynamic(
  () =>
    import("./_features/components/leads-client").then(
      (mod) => mod.LeadsClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function LeadsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 mb-10 max-w-7xl mx-auto">
      <LeadsClient />
    </div>
  );
}
