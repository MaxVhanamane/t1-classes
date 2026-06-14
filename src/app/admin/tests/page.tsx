"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const TestsClient = dynamic(
  () =>
    import("./_features/components/tests-client").then(
      (mod) => mod.TestsClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function AdminTestsPage() {
  return <TestsClient />;
}
