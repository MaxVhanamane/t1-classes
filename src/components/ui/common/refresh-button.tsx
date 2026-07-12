"use client";

import { useState, ComponentProps } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface RefreshButtonProps extends ComponentProps<typeof Button> {
  queryKey: QueryKey;
  isFetching?: boolean;
}

export function RefreshButton({
  queryKey,
  isFetching,
  className,
  variant = "outline",
  size = "default",
  ...props
}: RefreshButtonProps) {
  const queryClient = useQueryClient();

  // Keeps track of manual clicks so the UI feels instantly responsive
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // The icon spins if the parent tells it to, OR if it was just clicked
  const isSpinning = isFetching || isManualRefreshing;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey });
    } finally {
      setIsManualRefreshing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleRefresh}
      disabled={isSpinning || props.disabled}
      title="Refresh data"
      {...props}
    >
      <RefreshCw
        className={cn(
          "size-4",
          isSpinning && "animate-[spin_1.5s_linear_infinite]",
        )}
      />
      Refresh
    </Button>
  );
}
