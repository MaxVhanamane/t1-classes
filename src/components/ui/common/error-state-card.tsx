"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

type Props = {
  message?: string;
  onRetry?: () => void;
  centered?: boolean; // Defaults to true
};

export function ErrorStateCard({ message, onRetry, centered = true }: Props) {
  const content = (
    <Card className="w-full max-w-lg">
      <CardContent className="space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {message ?? "Failed to load data."}
        </p>

        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (centered) {
    return (
      <div className="flex h-(--h-viewport-minus-navbar) w-full items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
}
