"use client";

import { useState } from "react";

import { QueryKey } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { RefreshButton } from "@/src/components/ui/common/refresh-button";

import { GroupSessionDialog } from "./group-session-dialog";

type GroupSessionsPageHeaderProps = {
  isFetching: boolean;
  queryKey: QueryKey;
};

export function GroupSessionsPageHeader({
  isFetching,
  queryKey,
}: GroupSessionsPageHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Group Sessions
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage live group classes and batch sessions.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <RefreshButton queryKey={queryKey} isFetching={isFetching} />

          <Button
            onClick={() => setOpen(true)}
            className="flex-1 shrink-0 sm:w-auto sm:flex-none"
          >
            <Plus className="mr-2 size-4" />
            Create Session
          </Button>
        </div>
      </div>

      <GroupSessionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
