"use client";

import { useState } from "react";
import { Pencil, Trash2, Layers, HelpCircle, Trophy } from "lucide-react";

import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/src/components/ui/alert-dialog";

import LockedBadge from "@/src/components/ui/common/locked-badge";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { deleteTest } from "../actions/delete-test";
import { EditTestDialog } from "./edit-test-dialog";

import type { TestRow } from "../types/test.types";

type Props = {
  tests: TestRow[];
};

export function TestsList({ tests }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editingTest, setEditingTest] = useState<TestRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <div className="space-y-3">
        {tests.map((test) => {
          const locked = test.is_locked;

          return (
            <div
              key={test.id}
              onClick={() => router.push(`/admin/tests/${test.id}`)}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition hover:bg-muted/40 hover:shadow-sm"
            >
              {/* LEFT CONTENT */}
              <div className="min-w-0 flex flex-col">
                {/* --- HEADER GROUP (Title & Desc) --- */}
                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{test.title}</span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {test.test_type}
                    </Badge>
                  </div>

                  {test.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {test.description}
                    </p>
                  )}
                </div>

                {/* --- DETAILS GROUP (Equally Spaced) --- */}
                <div className="flex flex-col gap-2">
                  {/* 1. Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {test.test_type === "sectioned" && (
                      <div className="flex items-center gap-1.5">
                        <Layers className="size-4 text-sky-500" />
                        <span>
                          {test.total_sections}{" "}
                          {test.total_sections === 1 ? "Section" : "Sections"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="size-4 text-emerald-500" />
                      <span>
                        {test.total_questions}{" "}
                        {test.total_questions === 1 ? "Question" : "Questions"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Trophy className="size-4 text-amber-500" />
                      <span>{test.total_marks} Marks</span>
                    </div>
                  </div>

                  {/* 2. Subjects List */}
                  {test.subject_labels && test.subject_labels.length > 0 && (
                    <div
                      className="truncate font-medium text-xs text-foreground capitalize"
                      title={test.subject_labels.join(", ")}
                    >
                      <span className="font-normal text-muted-foreground">
                        {test.subject_labels.length === 1
                          ? "Subject: "
                          : "Subjects: "}
                      </span>
                      {test.subject_labels.join(", ")}
                    </div>
                  )}

                  {/* 3. Created Dates & Author */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="whitespace-nowrap">
                      Created{" "}
                      {new Date(test.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    {test.created_by && (
                      <>
                        <span className="hidden sm:inline whitespace-nowrap">
                          •
                        </span>
                        <span className="whitespace-nowrap">
                          By {test.created_by.full_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div
                className="flex shrink-0 items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {locked && <LockedBadge />}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingTest(test)}
                >
                  <Pencil className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (locked) {
                      toast.info(
                        "Locked tests cannot be deleted because students have already attempted the test.",
                      );
                      return;
                    }
                    setDeleteOpen(test.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>

                <AlertDialog
                  open={deleteOpen === test.id}
                  onOpenChange={(open) => setDeleteOpen(open ? test.id : null)}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this test?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this test and all its
                        sections, questions, attempts, and results.
                        <br />
                        <br />
                        <strong>This action cannot be undone.</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>
                        Cancel
                      </AlertDialogCancel>

                      <Button
                        variant="destructive"
                        disabled={deleting}
                        onClick={async () => {
                          setDeleting(true);

                          try {
                            const { error } = await callServerAction(
                              deleteTest(test.id),
                            );

                            if (error) {
                              toast.error(error);
                              return;
                            }

                            await queryClient.invalidateQueries({
                              queryKey: ["admin", "tests"],
                            });

                            toast.success("Test deleted");
                            setDeleteOpen(null);
                          } finally {
                            setDeleting(false);
                          }
                        }}
                      >
                        {deleting ? "Deleting..." : "Confirm Delete"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>

      {editingTest && (
        <EditTestDialog
          test={editingTest}
          open
          onOpenChange={() => setEditingTest(null)}
        />
      )}
    </>
  );
}
