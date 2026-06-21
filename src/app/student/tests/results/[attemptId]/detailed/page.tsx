"use client";

import dynamic from "next/dynamic";

import SuspenseLoading from "./_features/components/suspense-loading";

const DetailedResultClient = dynamic(
  () =>
    import("./_features/components/detailed-result-client").then(
      (mod) => mod.DetailedResultClient,
    ),
  {
    ssr: false,
    loading: () => <SuspenseLoading />,
  },
);

export default function DetailedPage() {
  return <DetailedResultClient />;
}
