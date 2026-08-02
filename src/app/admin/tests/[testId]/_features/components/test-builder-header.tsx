import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import type { TestBuilderTest } from "../types/test-builder.types";
import BackButtonClient from "./back-button-client";
import LockedBadge from "@/src/components/ui/common/locked-badge";

interface Props {
  test: TestBuilderTest;
  totalMarks: number;
  totalQuestions: number;
  totalSections: number;
}

export function TestBuilderHeader({
  test,
  totalMarks,
  totalQuestions,
  totalSections,
}: Props) {
  return (
    <>
      <BackButtonClient />

      <Card className="space-y-4 rounded-md p-3 shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold leading-tight">
              {test.title}
            </h1>

            {test.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {test.description}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
              {test.createdBy && (
                <>
                  <div className="min-w-0">
                    <span className="text-muted-foreground">Created By:</span>{" "}
                    <span
                      className="
                        font-medium text-foreground
                        sm:inline-block
                        sm:max-w-[320px]
                        sm:truncate
                        align-bottom
                      "
                      title={test.createdBy}
                    >
                      {test.createdBy}
                    </span>
                  </div>

                  <span className="hidden text-muted-foreground sm:inline">
                    •
                  </span>
                </>
              )}

              {test.test_type === "sectioned" && (
                <>
                  <div className="shrink-0">
                    <span className="text-muted-foreground">Sections:</span>{" "}
                    <span className="font-medium text-foreground">
                      {totalSections}
                    </span>
                  </div>

                  <span className="hidden text-muted-foreground sm:inline">
                    •
                  </span>
                </>
              )}

              <div className="shrink-0">
                <span className="text-muted-foreground">Total Questions:</span>{" "}
                <span className="font-medium text-foreground">
                  {totalQuestions}
                </span>
              </div>

              <span className="hidden text-muted-foreground sm:inline">•</span>

              <div className="shrink-0">
                <span className="text-muted-foreground">Total Marks:</span>{" "}
                <span className="font-medium text-foreground">
                  {totalMarks}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start">
            <Badge variant="outline" className="capitalize">
              {test.test_type}
            </Badge>

            {test.is_locked && <LockedBadge />}
          </div>
        </div>

        {test.is_locked && (
          <div className="rounded-md border border-amber-500 px-3 py-2 text-sm text-amber-500 dark:text-amber-400">
            This test is locked because it has already been scheduled or
            attempted by students. Sections and questions cannot be modified. If
            the test is only scheduled and has not started yet, you can delete
            the distribution to enable editing.
          </div>
        )}
      </Card>
    </>
  );
}
