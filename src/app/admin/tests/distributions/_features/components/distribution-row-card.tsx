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
import { ScheduleTestDialog } from "../../../schedule/_features/components/schedule-test-dialog";
import { DangerConfirmInput } from "@/src/components/ui/danger-confirm-input";
import Link from "next/link";

interface Props {
  item: DistributionItem;
}

export function DistributionRowCard({ item }: Props) {
  const router = useRouter();

  const [extendOpen, setExtendOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const scopeLabel = item.batch_name;
  const status = computeDistributionStatus(item.starts_at, item.ends_at);

  let deleteTitle = "";
  let deleteDescription = "";

  if (status === "scheduled") {
    deleteTitle = "Delete scheduled test?";
    deleteDescription =
      "This will permanently remove this test distribution. Students will no longer be able to attempt it.";
  }

  if (status === "ongoing") {
    deleteTitle = "Delete ongoing test?";
    deleteDescription =
      "This test is currently in progress. Deleting it will immediately stop the test for all students who are attempting it and their attempts may be lost.";
  }

  if (status === "completed") {
    deleteTitle = "Delete completed test distribution?";
    deleteDescription =
      "This will permanently delete the distribution and all associated student attempts and results. This action cannot be undone.";
  }

  async function handleDelete() {
    try {
      setDeleting(true);

      await deleteDistribution(item.id);

      toast.success("Distribution deleted");

      setDeleteOpen(false);
      setCanDelete(false);

      router.refresh();
    } catch {
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

          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {scopeLabel && (
              <span className="truncate max-w-56 sm:max-w-none">
                {scopeLabel}
              </span>
            )}

            <div className="flex gap-3 whitespace-nowrap">
              <span>
                Starts:{" "}
                {new Date(item.starts_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>

              <span>
                Ends:{" "}
                {new Date(item.ends_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant="secondary">{status}</Badge>

          {status === "scheduled" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
          )}

          {status === "ongoing" && (
            <Button size="sm" onClick={() => setExtendOpen(true)}>
              Extend
            </Button>
          )}

          {status === "completed" && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/admin/tests/distributions/${item.id}/results`}>
                Results
              </Link>
            </Button>
          )}

          {/* Delete */}
          <AlertDialog
            open={deleteOpen}
            onOpenChange={(v) => {
              setDeleteOpen(v);
              if (!v) setCanDelete(false);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>

                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>{deleteDescription}</p>

                    <DangerConfirmInput
                      confirmText="DELETE"
                      onValidChange={setCanDelete}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>

                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!canDelete || deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* EDIT */}
      <ScheduleTestDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        testId={item.test_id}
        distribution={{
          id: item.id,
          batch_id: item.batch_id,
          starts_at: item.starts_at,
          ends_at: item.ends_at,
          duration_minutes: item.duration_minutes,
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
