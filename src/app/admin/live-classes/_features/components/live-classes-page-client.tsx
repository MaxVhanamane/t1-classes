"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import { useLiveClasses } from "../hooks/use-live-classes";
import { LiveClassesTable } from "./live-classes-table";
import { LiveClassRow } from "../types/live-class.types";
import { LiveClassDialog } from "./live-class-dialog.tsx";
import { DeleteLiveClassDialog } from "./delete-live-class-dialog";

export function LiveClassesPageClient() {
  const [page, setPage] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedLiveClass, setSelectedLiveClass] =
    useState<LiveClassRow | null>(null);

  const limit = 10;

  const { data, isLoading } = useLiveClasses(page, limit);

  function handleCreate() {
    setSelectedLiveClass(null);
    setOpenDialog(true);
  }

  function handleEdit(row: LiveClassRow) {
    setSelectedLiveClass(row);
    setOpenDialog(true);
  }

  function handleDelete(row: LiveClassRow) {
    setSelectedLiveClass(row);
    setOpenDeleteDialog(true);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Live Classes
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage scheduled YouTube live classes.
            </p>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Live Class
          </Button>
        </div>

        <LiveClassesTable
          rows={data?.rows ?? []}
          total={data?.total ?? 0}
          page={page}
          limit={limit}
          loading={isLoading}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <LiveClassDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        liveClass={
          selectedLiveClass
            ? {
                id: selectedLiveClass.id,
                title: selectedLiveClass.title,
                description: selectedLiveClass.description,
                youtube_live_id: selectedLiveClass.youtube_live_id,
                starts_at: selectedLiveClass.starts_at,
                ends_at: selectedLiveClass.ends_at,
                batch_ids: selectedLiveClass.batch_ids,
              }
            : undefined
        }
      />

      <DeleteLiveClassDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        liveClass={selectedLiveClass}
      />
    </>
  );
}
