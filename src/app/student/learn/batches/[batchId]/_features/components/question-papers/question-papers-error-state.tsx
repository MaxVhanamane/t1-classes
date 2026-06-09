"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

type Props = {
  message?: string;

  onRetry?: () => void;
};

export function QuestionPapersErrorState({ message, onRetry }: Props) {
  return (
    <Card>
      <CardContent className="space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {message ?? "Failed to load question papers."}
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
