"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const FeesClient = dynamic(
  () =>
    import("./_features/components/fees-client").then((mod) => mod.FeesClient),
  {
    ssr: false,

    loading: () => <CenteredLoader />,
  },
);

export default function EnrollmentFeesPage() {
  return <FeesClient />;
}
