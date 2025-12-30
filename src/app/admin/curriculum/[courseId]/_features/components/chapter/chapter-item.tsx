"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDown, MoreVertical } from "lucide-react";

import { TopicItem } from "../topic/topic-item";
import { AddTopicDialog } from "../topic/add-topic-dialog";
import { RenameChapterDialog } from "./rename-chapter-dialog";
import { DeleteChapterDialog } from "./delete-chapter-dialog";
import { Chapter } from "../../types/course-structure.ui.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useIsTruncated } from "@/src/hooks/useIsTruncated";
import { ConfirmActionDialog } from "@/src/components/ui/common/confirm-action-dialog";
import { toggleChapterPublish } from "../../actions/chapter/toggle-chapter-publish";
import { toast } from "sonner";

interface ChapterItemProps {
  chapter: Chapter;
  courseId: string;
}

export function ChapterItem({ chapter, courseId }: ChapterItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { ref, isTruncated } = useIsTruncated<HTMLParagraphElement>();
  const expandChapter = () => {
    setExpanded(true);
  };

  return (
    <div className="rounded-md border p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        {/* Expand / collapse */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left cursor-pointer "
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <TooltipProvider delayDuration={300}>
            <Tooltip open={isTruncated ? undefined : false}>
              <TooltipTrigger asChild>
                <span ref={ref} className="font-medium text-sm line-clamp-2">
                  {chapter.title}
                </span>
              </TooltipTrigger>
              {isTruncated && (
                <TooltipContent side="top" align="start" className="max-w-xs">
                  <p className="text-sm whitespace-normal wrap-break-word">
                    {chapter.title}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Add topic */}
          <AddTopicDialog
            chapterId={chapter.id}
            courseId={courseId}
            expandChapter={expandChapter}
          />

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="flex flex-col ">
              <DropdownMenuItem asChild>
                <RenameChapterDialog
                  chapterId={chapter.id}
                  courseId={courseId}
                  currentTitle={chapter.title}
                />
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <DeleteChapterDialog
                  chapterId={chapter.id}
                  courseId={courseId}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <ConfirmActionDialog
                  title={
                    chapter.is_published
                      ? "Unpublish chapter?"
                      : "Publish chapter?"
                  }
                  description={
                    chapter.is_published
                      ? "This chapter will no longer be visible to students."
                      : "This chapter will become visible to students."
                  }
                  confirmLabel={chapter.is_published ? "Unpublish" : "Publish"}
                  confirmVariant="destructive"
                  onConfirm={async () => {
                    try {
                      await toggleChapterPublish({
                        chapterId: chapter.id,
                        courseId,
                        publish: !chapter.is_published,
                      });

                      toast.success(
                        chapter.is_published
                          ? "Chapter unpublished"
                          : "Chapter published"
                      );
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to update publish chapter"
                      );
                    }
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start gap-2 w-full cursor-pointer"
                    >
                      {chapter.is_published ? "Unpublish" : "Publish"}
                    </Button>
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Topics */}
      {expanded && (
        <div className="space-y-2 pl-6">
          {chapter.topics.length === 0 ? (
            <p className="text-xs text-muted-foreground">No topics added yet</p>
          ) : (
            chapter.topics.map((topic) => (
              <TopicItem
                key={topic.id}
                courseId={courseId}
                topicId={topic.id}
                title={topic.title}
                contentCount={topic.contentCount}
                is_published={topic.is_published}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
