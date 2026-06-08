"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

type Props = {
  message?: string;

  onRetry?: () => void;
};

export function BatchTestsErrorState({ message, onRetry }: Props) {
  return (
    <Card className="md:w-2xl">
      <CardContent className="space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {message ?? "Failed to load tests."}
        </p>

        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
