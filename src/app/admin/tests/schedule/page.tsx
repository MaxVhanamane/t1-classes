"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const ScheduleTestsClient = dynamic(
  () =>
    import("./_features/components/schedule-tests-client").then(
      (mod) => mod.ScheduleTestsClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function ScheduleTestsPage() {
  return <ScheduleTestsClient />;
}
