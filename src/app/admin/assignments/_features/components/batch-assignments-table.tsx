"use client";

import { useState } from "react";
import { format, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  FileCheck2,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

import { callServerAction } from "@/src/lib/actions/call-server-action";
import type { BatchAssignmentRow } from "../types/batch-assignments.types";
import { deleteBatchAssignment } from "../../actions/delete-batch-assignment";
import { cn } from "@/src/lib/utils";

type Props = {
  assignments: BatchAssignmentRow[];
  onEdit: (assignment: BatchAssignmentRow) => void;
  onViewPdf: (path: string, title: string) => void;
  onMark: (assignment: BatchAssignmentRow) => void;
};

export function BatchAssignmentsTable({
  assignments,
  onEdit,
  onViewPdf,
  onMark,
}: Props) {
  const queryClient = useQueryClient();
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    const toastId = toast.loading("Deleting assignment...");
    setIsDeleting(true);

    try {
      const { error } = await callServerAction(
        deleteBatchAssignment(assignmentToDelete),
      );

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      toast.success("Assignment deleted successfully", { id: toastId });

      await queryClient.invalidateQueries({
        queryKey: ["admin", "batch-assignments"],
      });
    } catch {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setIsDeleting(false);
      setAssignmentToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center font-medium shadow-[inset_-1px_0_0_0_var(--border-50)]">
                  No.
                </TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Solution</TableHead>

                <TableHead className="text-center font-medium">
                  Submissions
                </TableHead>
                <TableHead className="sticky right-0 z-20 w-16 bg-secondary text-center font-medium shadow-[inset_1px_0_0_0_var(--border-50)]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => {
                const { material, publish_date, due_date } = assignment;
                const isScheduled = isFuture(new Date(publish_date));
                const isCompleted = isPast(new Date(due_date));

                // Track if it was updated by comparing timestamps
                const isModified =
                  assignment.created_at !== assignment.updated_at;

                return (
                  <TableRow
                    key={assignment.id}
                    className="group transition-colors hover:bg-muted-subtle"
                  >
                    <TableCell className="sticky left-0 z-20 w-16 text-center bg-card font-semibold transition-colors group-hover:bg-muted-subtle shadow-[inset_-1px_0_0_0_var(--border-50)]">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div
                        className="font-medium truncate max-w-[200px]"
                        title={material.title}
                      >
                        {material.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {material.chapter.chapter_name}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-medium text-[11px] tracking-wide"
                      >
                        {material.homework_type === "dpp"
                          ? "DPP"
                          : "Assignment"}
                      </Badge>
                    </TableCell>

                    <TableCell className="capitalize">
                      {material.chapter.subject}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        {assignment.creator && (
                          <span
                            className="font-medium text-sm truncate max-w-[140px]"
                            title={assignment.creator.full_name}
                          >
                            {assignment.creator.full_name}
                          </span>
                        )}
                        {isModified && assignment.updater && (
                          <span
                            className="text-[10px] text-muted-foreground truncate max-w-[140px] mt-0.5"
                            title={`Edited by ${assignment.updater.full_name}`}
                          >
                            Edited by {assignment.updater.full_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isScheduled ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1.5 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium px-2.5 py-0.5 ",
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Scheduled
                        </Badge>
                      ) : isCompleted ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1.5 border-border/60 bg-muted/40 text-muted-foreground font-medium px-2.5 py-0.5 ",
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-0.5 ",
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                          Open
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(publish_date), "dd MMM yyyy, hh:mm a")}
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(due_date), "dd MMM yyyy, hh:mm a")}
                    </TableCell>

                    <TableCell>
                      {assignment.is_solution_visible ? (
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary"
                        >
                          Visible
                        </Badge>
                      ) : assignment.auto_publish_solution_at ? (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Auto:{" "}
                          {format(
                            new Date(assignment.auto_publish_solution_at),
                            "dd MMM",
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMark(assignment)}
                        className="h-8 shadow-none whitespace-nowrap"
                      >
                        <ClipboardCheck className="mr-2 h-4 w-4 text-primary" />
                        Mark Submissions
                      </Button>
                    </TableCell>

                    <TableCell className="sticky right-0 z-20 text-center bg-card transition-colors group-hover:bg-muted-subtle shadow-[inset_1px_0_0_0_var(--border-50)]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem
                            onClick={() =>
                              onViewPdf(
                                material.file_path,
                                `${material.title} - Question`,
                              )
                            }
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Question PDF
                          </DropdownMenuItem>

                          {material.solution_file_path && (
                            <DropdownMenuItem
                              onClick={() =>
                                onViewPdf(
                                  material.solution_file_path!,
                                  `${material.title} - Solution`,
                                )
                              }
                            >
                              <FileCheck2 className="mr-2 h-4 w-4 text-green-600" />
                              View Solution PDF
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => onEdit(assignment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Settings
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setAssignmentToDelete(assignment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from Batch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog
        open={!!assignmentToDelete}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this material from the batch.
              Students will no longer be able to see or access it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove Assignment
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
