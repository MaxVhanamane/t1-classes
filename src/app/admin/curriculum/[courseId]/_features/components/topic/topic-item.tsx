"use client";

import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { FileText, MoreVertical } from "lucide-react";
import { RenameTopicDialog } from "./rename-topic-dialog";
import { DeleteTopicDialog } from "./delete-topic-dialog";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useIsTruncated } from "@/src/hooks/useIsTruncated";
import { ConfirmActionDialog } from "@/src/components/ui/common/confirm-action-dialog";
import { toast } from "sonner";
import { toggleTopicPublish } from "../../actions/topic/toggle-topic-publish";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface TopicItemProps {
  courseId: string;
  topicId: string;
  title: string;
  contentCount: number;
  is_published: boolean;
}

export function TopicItem({
  courseId,
  topicId,
  title,
  contentCount,
  is_published,
}: TopicItemProps) {
  const pathname = usePathname();
  const { ref, isTruncated } = useIsTruncated<HTMLParagraphElement>();

  const isActive =
    pathname === `/admin/curriculum/${courseId}/topics/${topicId}`;

  const href = {
    pathname: `/admin/curriculum/${courseId}/topics/${topicId}`,
    query: {
      title,
    },
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
        isActive ? "bg-muted border-gray-400" : "hover:bg-muted/40",
      )}
    >
      {/* Clickable content */}
      <Link
        prefetch={false}
        href={href}
        className="flex flex-1 items-center gap-3 cursor-pointer"
      >
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />

        <div className="min-w-0">
          <TooltipProvider delayDuration={300}>
            <Tooltip open={isTruncated ? undefined : false}>
              <TooltipTrigger asChild>
                <p
                  ref={ref}
                  className="
          text-sm font-medium
          line-clamp-2
          wrap-break-word
          cursor-pointer
        "
                >
                  {title}
                </p>
              </TooltipTrigger>

              {isTruncated && (
                <TooltipContent side="top" align="start" className="max-w-xs">
                  <p className="text-sm whitespace-normal wrap-break-word">
                    {title}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <p className="text-xs text-muted-foreground">
            {contentCount} item{contentCount === 1 ? "" : "s"}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer shrink-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex flex-col p-2">
          <DropdownMenuItem asChild>
            <ConfirmActionDialog
              title={is_published ? "Unpublish topic?" : "Publish topic?"}
              description={
                is_published
                  ? "This topic will no longer be visible to students."
                  : "This topic will become visible to students."
              }
              confirmLabel={is_published ? "Unpublish" : "Publish"}
              onConfirm={async () => {
                const { error } = await callServerAction(
                  toggleTopicPublish({
                    courseId,
                    topicId,
                    publish: !is_published,
                  }),
                );

                if (error) {
                  toast.error(error);
                  return;
                }

                toast.success(
                  is_published ? "Topic unpublished" : "Topic published",
                );
              }}
              trigger={
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-start gap-2 cursor-pointer"
                >
                  {is_published ? <>Unpublish</> : <>Publish</>}
                </Button>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <RenameTopicDialog
              courseId={courseId}
              topicId={topicId}
              currentTitle={title}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <DeleteTopicDialog courseId={courseId} topicId={topicId} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
