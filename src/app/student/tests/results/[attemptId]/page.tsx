"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const ResultClient = dynamic(
  () =>
    import("./_features/components/result-client").then(
      (mod) => mod.ResultClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

const ResultsOverview = () => {
  return <ResultClient />;
};

export default ResultsOverview;
