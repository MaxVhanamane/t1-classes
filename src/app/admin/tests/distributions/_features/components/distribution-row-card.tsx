"use client";

import { useState } from "react";
import { Layers, HelpCircle, Trophy } from "lucide-react";

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
import { useQueryClient } from "@tanstack/react-query";

import { DistributionItem } from "../types/distribution.types";
import { computeDistributionStatus } from "../helpers/compute-distribution-status";
import { ExtendDistributionDialog } from "./extend-distribution-dialog";
import { deleteDistribution } from "../actions/delete-distribution";
import { ScheduleTestDialog } from "../../../schedule/_features/components/schedule-test-dialog";
import { DangerConfirmInput } from "@/src/components/ui/danger-confirm-input";
import { Link } from "@/src/components/ui/link";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface Props {
  item: DistributionItem;
}

export function DistributionRowCard({ item }: Props) {
  const queryClient = useQueryClient();

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
    setDeleting(true);

    const { error } = await callServerAction(deleteDistribution(item.id));

    if (error) {
      toast.error(error);
      setDeleting(false);
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin", "test-distributions"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin", "tests"],
      }),
    ]);

    toast.success("Distribution deleted");
    setDeleteOpen(false);
    setCanDelete(false);
    setDeleting(false);
  }

  return (
    <Card className="p-4 transition hover:bg-muted/40 shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Content - min-w-0 and flex-1 are crucial here for truncation to work in flex! */}
        <div className="space-y-2 min-w-0 flex-1">
          {/* Title & Badge */}
          <div className="flex items-center gap-2">
            <span
              className="truncate text-base font-semibold"
              title={item.test_title}
            >
              {item.test_title}
            </span>
            <Badge variant="outline" className="shrink-0 capitalize text-xs">
              {item.test_type}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            {item.test_type === "sectioned" && (
              <div className="flex shrink-0 items-center gap-1.5">
                <Layers className="size-4 text-sky-500" />
                <span>
                  {item.total_sections}{" "}
                  {item.total_sections === 1 ? "Section" : "Sections"}
                </span>
              </div>
            )}

            <div className="flex shrink-0 items-center gap-1.5">
              <HelpCircle className="size-4 text-emerald-500" />
              <span>
                {item.total_questions}{" "}
                {item.total_questions === 1 ? "Question" : "Questions"}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Trophy className="size-4 text-amber-500" />
              <span>{item.total_marks} Marks</span>
            </div>
          </div>

          {/* Metadata Block (Subjects, Assigned To, Dates) */}
          <div className="mt-1 flex flex-col gap-1.5 text-xs text-muted-foreground">
            {/* Batch Name */}
            {scopeLabel && (
              <div
                className="truncate font-medium text-foreground"
                title={`Assigned to: ${scopeLabel}`}
              >
                <span className="font-normal text-muted-foreground">
                  Assigned to:{" "}
                </span>
                {scopeLabel}
              </div>
            )}

            {item.subject_labels && item.subject_labels.length > 0 && (
              <div
                className="truncate font-medium text-foreground capitalize"
                title={item.subject_labels.join(", ")}
              >
                <span className="font-normal text-muted-foreground">
                  {item.subject_labels.length === 1
                    ? "Subject: "
                    : "Subjects: "}
                </span>
                {item.subject_labels.join(", ")}
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="whitespace-nowrap">
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
              <span className="hidden sm:inline whitespace-nowrap">•</span>
              <span className="whitespace-nowrap">
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
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
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
