"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const AttendancePageClient = dynamic(
  () =>
    import("./_features/components/attendance-page-client").then(
      (mod) => mod.AttendancePageClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function AttendancePage() {
  return <AttendancePageClient />;
}
