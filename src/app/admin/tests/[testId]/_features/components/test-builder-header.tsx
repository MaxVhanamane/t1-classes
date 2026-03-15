import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import type { TestBuilderTest } from "../types/test-builder.types";
import BackButtonClient from "./back-button-client";
import LockedBadge from "@/src/components/ui/common/locked-badge";

interface Props {
  test: TestBuilderTest;
}

export function TestBuilderHeader({ test }: Props) {
  return (
    <>
      <BackButtonClient />

      <Card className="p-4 space-y-3 shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {test.title}
            </h1>

            {test.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {test.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {test.test_type}
            </Badge>

            {test.is_locked && <LockedBadge />}
          </div>
        </div>

        {test.is_locked && (
          <div className="flex  gap-2 rounded-md border border-amber-500 px-3 py-2 text-sm text-amber-500 dark:text-amber-400">
            <span>
              This test is locked because it has already been scheduled or
              attempted by students. Sections and questions cannot be modified.
              If the test is only scheduled and has not started yet, you can
              delete the distribution to enable editing.
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
