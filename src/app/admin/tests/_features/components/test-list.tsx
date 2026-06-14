"use client";

import { useState } from "react";

import { Pencil, Trash2 } from "lucide-react";

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
              {/* LEFT */}
              <div className="min-w-0 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{test.title}</span>

                  <Badge variant="outline" className="capitalize text-xs">
                    {test.test_type}
                  </Badge>
                </div>

                {test.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {test.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Created{" "}
                    {new Date(test.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {test.created_by && (
                    <span>By {test.created_by.full_name}</span>
                  )}
                </div>
              </div>

              {/* RIGHT */}
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
