"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/src/components/ui/alert-dialog";

import { toast } from "sonner";

import { DistributionItem } from "../types/distribution.types";
import { computeDistributionStatus } from "../helpers/compute-distribution-status";
import { ExtendDistributionDialog } from "./extend-distribution-dialog";
import { deleteDistribution } from "../actions/delete-distribution";
import { ScheduleTestDialog } from "../../../schedule/_features/components/ScheduleTestDialog";

interface Props {
  item: DistributionItem;
}

export function DistributionRowCard({ item }: Props) {
  const router = useRouter();

  const [extendOpen, setExtendOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const scopeLabel =
    item.audience === "batch"
      ? item.batch_name
      : item.audience === "course"
      ? item.course_title
      : "Marketing";

  const status = computeDistributionStatus(item.starts_at, item.ends_at);

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteDistribution(item.id);
      toast.success("Distribution deleted");

      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete distribution");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="p-4 transition hover:bg-muted/40 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Content */}
        <div className="space-y-2 min-w-0">
          <div className="font-medium truncate text-base">
            {item.test_title}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{item.audience}</Badge>

            {scopeLabel && (
              <span className="truncate max-w-56 sm:max-w-none">
                {scopeLabel}
              </span>
            )}

            <span className="whitespace-nowrap">
              {new Date(item.starts_at).toLocaleString()} →{" "}
              {new Date(item.ends_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant="secondary">{status}</Badge>

          {status === "scheduled" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                Edit
              </Button>

              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Delete
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete scheduled test?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this test distribution.
                      Students will no longer be able to attempt it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      Cancel
                    </AlertDialogCancel>

                    <Button onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {status === "ongoing" && (
            <Button size="sm" onClick={() => setExtendOpen(true)}>
              Extend
            </Button>
          )}

          {status === "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(`/admin/tests/distributions/${item.id}/results`)
              }
            >
              Results
            </Button>
          )}
        </div>
      </div>

      {/* EDIT */}
      <ScheduleTestDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        testId={item.test_id}
        distribution={{
          id: item.id,
          audience: item.audience,
          batch_id: item.batch_id,
          course_id: item.course_id,
          starts_at: item.starts_at,
          ends_at: item.ends_at,
          duration_minutes: item.duration_minutes,
          max_attempts: item.max_attempts,
        }}
      />

      {/* EXTEND */}
      <ExtendDistributionDialog
        open={extendOpen}
        onOpenChange={setExtendOpen}
        distributionId={item.id}
        currentEndsAt={item.ends_at}
      />
    </Card>
  );
}
