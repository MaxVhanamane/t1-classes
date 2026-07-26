"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Pencil,
  User,
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
  Clock,
  Check,
  Trash2,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import type {
  SyllabusChapterRow,
  ProgressStatus,
} from "../types/syllabus-progress.types";
import { updateChapterStatus } from "../actions/update-chapter-status";
import { verifyChapter } from "../actions/verify-chapter";
import { deleteChapter } from "../actions/delete-chapter";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface ChapterRowItemProps {
  chapter: SyllabusChapterRow;
  isAdmin: boolean;
  onEditTitle: (chapter: SyllabusChapterRow) => void;
  onRefresh: () => void;
}

export function ChapterRowItem({
  chapter,
  isAdmin,
  onEditTitle,
  onRefresh,
}: ChapterRowItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog States
  const [pendingStatus, setPendingStatus] = useState<ProgressStatus | null>(
    null,
  );
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /* ---------- Handlers ---------- */
  const handleStatusSelect = (newStatus: ProgressStatus) => {
    if (newStatus === chapter.status) return;
    setPendingStatus(newStatus);
    setIsStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    setIsUpdating(true);
    const toastId = toast.loading("Updating status...");

    const { error } = await callServerAction(
      updateChapterStatus({ chapter_id: chapter.id, status: pendingStatus }),
    );

    setIsUpdating(false);
    setIsStatusDialogOpen(false);
    setPendingStatus(null);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Status updated!", { id: toastId });
    onRefresh();
  };

  const confirmVerify = async () => {
    setIsUpdating(true);
    const toastId = toast.loading("Verifying chapter...");

    const { error } = await callServerAction(
      verifyChapter({ chapter_id: chapter.id }),
    );

    setIsUpdating(false);
    setIsVerifyDialogOpen(false);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Chapter verified!", { id: toastId });
    onRefresh();
  };

  const confirmDelete = async () => {
    setIsUpdating(true);
    const toastId = toast.loading("Deleting chapter...");

    const { error } = await callServerAction(
      deleteChapter({ chapter_id: chapter.id }),
    );

    setIsUpdating(false);
    setIsDeleteDialogOpen(false);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Chapter deleted", { id: toastId });
    onRefresh();
  };

  /* ---------- Formatting & Styles ---------- */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isCompleted = chapter.status === "completed";
  const isVerified = Boolean(chapter.verified_at);
  const needsVerification = isCompleted && !isVerified;

  // Premium Row Accent Styling (Clean borders, subtle backgrounds)
  let rowStyles =
    "border-l-4 border-l-border/50 bg-card hover:bg-muted/20 border border-border/50 shadow-sm";

  if (isVerified) {
    rowStyles =
      "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/50 border border-blue-100 dark:border-blue-600 shadow-sm transition-all";
  } else if (chapter.status === "completed") {
    rowStyles =
      "border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40 border border-emerald-100 dark:border-emerald-600 shadow-sm transition-all";
  } else if (chapter.status === "in_progress") {
    rowStyles =
      "border-l-4 border-l-yellow-500 bg-yellow-50/20 dark:bg-yellow-950/10 hover:bg-yellow-50/40 border border-yellow-100 dark:border-yellow-600 shadow-sm transition-all";
  }

  // Dynamic Dialog Messages
  const getStatusWarning = () => {
    if (pendingStatus === "completed") {
      return "This will mark the chapter as finished and record today's date as the completion time. Are you sure?";
    }
    if (pendingStatus === "in_progress") {
      return "This will mark the chapter as ongoing. (If it was previously completed, its original completion date will be saved in history).";
    }
    return "This will completely reset the chapter. Any existing start or completion dates will be permanently erased.";
  };

  // Reusable muted pill style for dates
  const neutralPillStyles =
    "flex items-center gap-1.5 text-muted-foreground bg-muted/40 px-2.5 py-0.5 rounded-md border border-border/40";

  return (
    <>
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl duration-300 group ${rowStyles}`}
      >
        {/* Left side: Content & Metadata */}
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {/* Title & Actions Row */}
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-foreground truncate">
              {chapter.title}
            </span>

            {/* Admin Chapter Actions (3-Dots Menu) */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors shrink-0"
                    disabled={isUpdating}
                  >
                    <MoreVertical className="size-3.5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => onEditTitle(chapter)}
                    className="cursor-pointer"
                  >
                    <Pencil className="size-4 mr-2" />
                    Edit Title
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Chapter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Metadata Pills Row (Neutralized for better hierarchy) */}
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
              {chapter.started_at && (
                <div className={neutralPillStyles}>
                  <PlayCircle className="size-3" />
                  Started: {formatDate(chapter.started_at)}
                </div>
              )}

              {chapter.completed_at && (
                <div className={neutralPillStyles}>
                  <CheckCircle2 className="size-3" />
                  Completed: {formatDate(chapter.completed_at)}
                </div>
              )}

              {/* Updated By (Truncated with Tooltip) */}
              {chapter.updated_by && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`${neutralPillStyles} cursor-default`}>
                      <User className="size-3" />
                      <span className="truncate max-w-30">
                        by {chapter.updated_by.full_name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Updated by {chapter.updated_by.full_name}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Verified Badge (This gets the premium color to stand out) */}
              {isVerified && chapter.verified_by && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20 shadow-sm cursor-default">
                      <ShieldCheck className="size-3" />
                      <span className="truncate max-w-38">
                        Verified by {chapter.verified_by.full_name}
                      </span>
                      <span className="opacity-60 ml-0.5">
                        on {formatDate(chapter.verified_at)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Verified by {chapter.verified_by.full_name} on{" "}
                      {formatDate(chapter.verified_at)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* Right side: Actions (Forced Right on Mobile) */}
        <div className="flex items-center justify-end gap-3 shrink-0 w-full md:w-auto mt-1 md:mt-0">
          {/* Admin Verification Button (blue Elegance) */}
          {isAdmin && needsVerification && (
            <Button
              size="sm"
              className="h-9 text-xs font-semibold bg-blue-50 text-foreground hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/30  dark:border-blue-800 dark:hover:bg-blue-900/50 shadow-sm transition-colors"
              onClick={() => setIsVerifyDialogOpen(true)}
              disabled={isUpdating}
            >
              <ShieldCheck className="size-3.5 mr-1" /> Verify
            </Button>
          )}

          {/* Status Dropdown */}
          <Select
            value={chapter.status}
            onValueChange={(val) => handleStatusSelect(val as ProgressStatus)}
            disabled={isUpdating || isVerified} // Lock dropdown if verified
          >
            <SelectTrigger
              className={`w-35 h-9 text-xs font-medium bg-background border-input text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors [&_svg]:opacity-100
      ${isVerified ? "opacity-60 cursor-not-allowed shadow-none" : ""}
    `}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started" className="font-medium">
                <span className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted-foreground" /> Not
                  Started
                </span>
              </SelectItem>
              <SelectItem value="in_progress" className="font-medium">
                <span className="flex items-center gap-2">
                  <PlayCircle className="size-3.5 text-muted-foreground" /> In
                  Progress
                </span>
              </SelectItem>
              <SelectItem value="completed" className="font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-muted-foreground" />{" "}
                  Completed
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Dialogs --- */}

      {/* Status Change Confirmation */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Chapter Status</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {getStatusWarning()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmStatusChange();
              }}
              disabled={isUpdating}
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Confirmation */}
      <AlertDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <ShieldCheck className="size-5" /> Verify Chapter Completion
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              You are about to verify that <strong>{chapter.title}</strong> has
              been successfully taught and meets the required standards. Your
              name and today&apos;s date will be permanently attached to this
              chapter, and the status will be locked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmVerify();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isUpdating}
            >
              <Check className="size-4 mr-2" /> Verify Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" /> Delete Chapter
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong>{chapter.title}</strong>? This will erase all progress and
              verification history associated with it. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isUpdating}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
