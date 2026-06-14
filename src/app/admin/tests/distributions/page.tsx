"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const DistributionsClient = dynamic(
  () =>
    import("./_features/components/distributions-client").then(
      (mod) => mod.DistributionsClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function DistributionsPage() {
  return <DistributionsClient />;
}
