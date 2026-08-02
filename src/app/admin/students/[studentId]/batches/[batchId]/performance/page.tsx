"use client";

import { Button } from "@/src/components/ui/button";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const PerformanceDashboardClient = dynamic(
  () =>
    import("@/src/app/student/performance/[batchId]/_features/components/performance-dashboard-client").then(
      (mod) => mod.PerformanceDashboardClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen w-full justify-center p-4 pt-24 sm:p-8 sm:pt-32">
        <LoadingIndicator message="Loading dashboard..." />
      </div>
    ),
  },
);

export default function AdminStudentPerformancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto w-full max-w-8xl p-2 sm:p-8">
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-transparent pl-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Results
          </Button>
        </div>
        <PerformanceDashboardClient />
      </div>
    </div>
  );
}
