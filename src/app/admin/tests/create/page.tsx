"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const CreateTestPageClient = dynamic(
  () =>
    import("./_features/components/create-test-page-client").then(
      (mod) => mod.CreateTestPageClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function CreateTestPage() {
  return <CreateTestPageClient />;
}
