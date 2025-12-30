"use client";

import { useState } from "react";
import { BatchesHeader } from "./batches-header";
import { BatchesTable } from "./batches-table";
import { BatchesCards } from "./batches-cards";
import { BatchDialog } from "./batch-dialog";
import type { BatchListItem, CourseSelectItem } from "../types/types";

type Props = {
  batches: BatchListItem[];
  courses: CourseSelectItem[];
};

export function BatchesClient({ batches, courses }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BatchListItem | null>(null);

  return (
    <>
      <BatchesHeader
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
      />

      <BatchesTable
        batches={batches}
        onEdit={(batch) => {
          setEditing(batch);
          setOpen(true);
        }}
      />

      <BatchesCards
        batches={batches}
        onEdit={(batch) => {
          setEditing(batch);
          setOpen(true);
        }}
      />

      <BatchDialog
        key={editing?.id ?? "create"}
        open={open}
        onOpenChange={setOpen}
        batch={editing ?? undefined}
        courses={courses}
      />
    </>
  );
}
