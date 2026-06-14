"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const TestBuilderClient = dynamic(
  () =>
    import("./_features/components/test-builder-client").then(
      (mod) => mod.TestBuilderClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function TestBuilderPage() {
  return <TestBuilderClient />;
}
