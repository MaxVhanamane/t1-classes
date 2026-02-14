"use client";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Trash2, Pencil, Lock } from "lucide-react";
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
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";

import { TestRow } from "../types/test.types";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { EditTestDialog } from "./edit-test-dialog";
import { useRouter } from "nextjs-toploader/app";

export function TestsList({ tests }: { tests: TestRow[] }) {
  const router = useRouter();
  const [editingTest, setEditingTest] = useState<TestRow | null>(null);

  return (
    <div className="mt-6 space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Tests</h2>
        <Button size="sm" onClick={() => router.push("/admin/tests/create")}>
          + Create Test
        </Button>
      </div>

      <div className="divide-y rounded-md border">
        {tests.map((test) => {
          const locked = test.is_locked;

          return (
            <div
              key={test.id}
              onClick={() => {
                router.push(`/admin/tests/${test.id}`);
              }}
              className={cn(
                "flex items-center justify-between px-4 py-3 cursor-pointer transition",
                locked
                  ? "bg-muted/30 text-muted-foreground"
                  : "hover:bg-muted/40"
              )}
            >
              {/* LEFT */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{test.title}</span>

                  {locked && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="text-xs">{test.description}</span>
                </div>

                <div className="flex gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline">{test.test_type}</Badge>
                  <span>
                    Created {new Date(test.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTest(test);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <AlertDialog>
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
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await deleteTest(test.id);
                            toast.success("Test deleted");
                            router.refresh();
                          } catch {
                            toast.error("Failed to delete test");
                          }
                        }}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {editingTest && (
                  <EditTestDialog
                    test={editingTest}
                    open={true}
                    onOpenChange={() => setEditingTest(null)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
