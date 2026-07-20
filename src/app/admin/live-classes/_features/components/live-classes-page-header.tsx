"use client";

import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { QueryKey } from "@tanstack/react-query";
import { RefreshButton } from "@/src/components/ui/common/refresh-button";

type Props = {
  onCreate: () => void;
  isFetching: boolean;
  queryKey: QueryKey;
};

export function LiveClassesPageHeader({
  queryKey,
  isFetching,
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Live Classes</h1>

        <p className="text-sm text-muted-foreground">
          Manage scheduled YouTube live classes.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <RefreshButton queryKey={queryKey} isFetching={isFetching} />

        <Button onClick={onCreate} className="shrink-0">
          <Plus className="mr-2 size-4" />
          Create Live Class
        </Button>
      </div>
    </div>
  );
}
