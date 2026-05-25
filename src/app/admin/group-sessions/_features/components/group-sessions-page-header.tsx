"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import { GroupSessionDialog } from "./group-session-dialog";

export function GroupSessionsPageHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Group Sessions
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage live group classes and batch sessions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Session
          </Button>
        </div>
      </div>

      <GroupSessionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
