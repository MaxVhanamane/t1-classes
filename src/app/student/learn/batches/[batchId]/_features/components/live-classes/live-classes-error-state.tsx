"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

type Props = {
  message: string;

  onRetry?: () => void;
};

export function LiveClassesErrorState({ message, onRetry }: Props) {
  return (
    <Card className="border-destructive/20 md:w-2xl">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full border">
          <AlertCircle className="text-destructive size-5" />
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold">Failed to Load Live Classes</h3>

          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
