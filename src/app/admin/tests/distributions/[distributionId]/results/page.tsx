"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const ResultsClient = dynamic(
  () =>
    import("./_features/components/results-client").then(
      (mod) => mod.ResultsClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function DistributionResultsPage() {
  return <ResultsClient />;
}
