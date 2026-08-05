"use client";
import dynamic from "next/dynamic";

import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

const ResultClient = dynamic(
  () =>
    import("./_features/components/result-client").then(
      (mod) => mod.ResultClient,
    ),
  {
    ssr: false,
    // 2. Use the exact same wrapper and loader as the child component
    loading: () => (
      <div className="flex h-(--h-viewport-minus-navbar) w-full items-center justify-center">
        <LoadingIndicator
          message="Loading test result..."
          type="spiked"
          showGlow
        />
      </div>
    ),
  },
);

const ResultsOverview = () => {
  return <ResultClient />;
};

export default ResultsOverview;
