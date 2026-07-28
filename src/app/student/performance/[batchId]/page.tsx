"use client";

import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import dynamic from "next/dynamic";

// Disable SSR for the heavy charts and react-query fetching
const PerformanceDashboardClient = dynamic(
  () =>
    import("./_features/components/PerformanceDashboardClient").then(
      (mod) => mod.PerformanceDashboardClient,
    ),
  {
    ssr: false,
    loading: () => (
      // Top-anchored, same padding as the real content's outer wrapper
      // (space-y-8 p-4 sm:p-8) — NOT vertically centered — so nothing
      // redistributes when real content swaps in. min-h-screen just
      // reserves scroll-space so the swap-in doesn't cause a height jump.
      <div className="flex min-h-screen w-full justify-center p-4 pt-24 sm:p-8 sm:pt-32">
        <LoadingIndicator message="Loading dashboard..." />
      </div>
    ),
  },
);

export default function BatchPerformancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground [overflow-anchor:none]">
      <div className="mx-auto w-full max-w-7xl">
        <PerformanceDashboardClient />
      </div>
    </div>
  );
}
