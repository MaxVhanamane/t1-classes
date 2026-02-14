import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import type { TestBuilderTest } from "../types/test-builder.types";
import BackButtonClient from "./back-button-client";

interface Props {
  test: TestBuilderTest;
}

export function TestBuilderHeader({ test }: Props) {
  return (
    <>
      <BackButtonClient />
      <Card className="p-4 space-y-2 shadow-none">
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

          <Badge variant="outline" className="capitalize">
            {test.testType}
          </Badge>
        </div>
      </Card>
    </>
  );
}
