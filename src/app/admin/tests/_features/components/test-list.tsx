"use client";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteTest } from "../actions/delete-test";
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
import Link from "next/link";
import { TestRow } from "../types/test.types";
import { useState } from "react";
import { EditTestDialog } from "./edit-test-dialog";
import { useRouter } from "nextjs-toploader/app";
import LockedBadge from "@/src/components/ui/common/locked-badge";

function generatePages(current: number, total: number) {
  const pages: (number | "...")[] = [];
  const delta = 2;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}

export function TestsList({
  tests,
  currentPage,
  totalPages,
}: {
  tests: TestRow[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();

  const [editingTest, setEditingTest] = useState<TestRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pages = generatePages(currentPage, totalPages);

  return (
    <div className="mt-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Tests</h2>

        <Button size="sm" onClick={() => router.push("/admin/tests/create")}>
          + Create Test
        </Button>
      </div>

      {/* TEST LIST */}
      <div className="space-y-3">
        {tests.map((test) => {
          const locked = test.is_locked;

          return (
            <div
              key={test.id}
              onClick={() => router.push(`/admin/tests/${test.id}`)}
              className="flex items-start justify-between gap-4 border rounded-lg p-4 hover:bg-muted/40 hover:shadow-sm transition cursor-pointer"
            >
              {/* LEFT CONTENT */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{test.title}</span>

                  <Badge variant="outline" className="capitalize text-xs">
                    {test.test_type}
                  </Badge>
                </div>

                {test.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {test.description}
                  </p>
                )}

                <span className="text-xs text-muted-foreground">
                  Created{" "}
                  {new Date(test.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* RIGHT SIDE */}
              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {locked && <LockedBadge />}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTest(test);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <AlertDialog
                  open={deleteOpen === test.id}
                  onOpenChange={(v) => setDeleteOpen(v ? test.id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={locked}
                      aria-label="Delete test"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this test?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This will permanently delete this test and all its
                        sections, questions, attempts, and results.
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
                          try {
                            setDeleting(true);

                            await deleteTest(test.id);

                            toast.success("Test deleted");

                            setDeleting(false);

                            setTimeout(() => {
                              setDeleteOpen(null);
                            }, 400);
                          } catch {
                            setDeleting(false);
                            toast.error("Failed to delete test");
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

      {/* EDIT DIALOG */}
      {editingTest && (
        <EditTestDialog
          test={editingTest}
          open={true}
          onOpenChange={() => setEditingTest(null)}
        />
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            asChild={currentPage !== 1}
          >
            {currentPage === 1 ? (
              <span>Prev</span>
            ) : (
              <Link href={`?page=${currentPage - 1}`}>Prev</Link>
            )}
          </Button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`?page=${p}`}>{p}</Link>
              </Button>
            ),
          )}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            asChild={currentPage !== totalPages}
          >
            {currentPage === totalPages ? (
              <span>Next</span>
            ) : (
              <Link href={`?page=${currentPage + 1}`}>Next</Link>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
