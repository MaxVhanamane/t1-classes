"use client";

import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

import { Link } from "@/src/components/ui/link";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { useEnrollmentFees } from "../hooks/use-enrollment-fees";

import { FeeSection } from "./fee-section";
import FeePageSkeleton from "./fee-page-skeleton";

export function FeesClient() {
  const params = useParams<{
    enrollmentId: string;
  }>();

  const enrollmentId = params.enrollmentId;

  const { data, isLoading, isFetching, error, refetch } =
    useEnrollmentFees(enrollmentId);

  if (error instanceof Error) {
    return (
      <BatchTestsErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (isLoading || !data) {
    return <FeePageSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 mb-10 max-w-5xl">
      <div className="space-y-2">
        <Link
          href="/admin/enrollments"
          className="
      inline-flex items-center gap-2
      text-sm font-medium text-muted-foreground
      transition-colors hover:text-foreground
    "
        >
          <ArrowLeft className="size-4" />
          Back to enrollments
        </Link>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Fees</h1>

          {isFetching && <LoadingIndicator className="size-4" />}
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {data.enrollment.student.fullName}
          </span>

          <span className="mx-2">•</span>

          <span className="capitalize">{data.enrollment.target.type}</span>

          <span className="mx-2">•</span>

          <span>{data.enrollment.target.title}</span>

          {data.enrollment.student.phone && (
            <>
              <span className="mx-2">•</span>

              <span>{data.enrollment.student.phone}</span>
            </>
          )}
        </div>
      </div>

      <FeeSection enrollmentId={enrollmentId} data={data} />
    </div>
  );
}
