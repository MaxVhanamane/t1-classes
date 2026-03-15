"use client";

import { useState } from "react";
import { MoreVertical, Play, Video } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { VideoEmbed } from "./video-embed";
import { DeleteVideoDialog } from "./delete-video-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/src/components/ui/dropdown-menu";

import { EditVideoDialog } from "./edit-video-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { useIsTruncated } from "@/src/hooks/useIsTruncated";
import { ConfirmActionDialog } from "@/src/components/ui/common/confirm-action-dialog";
import { VideoUnit } from "../../types/course-unit.types";
import { toast } from "sonner";
import { toggleCourseUnitPublish } from "../../actions/topic/toggleCourseUnitPublish";

interface VideoItemProps {
  video: VideoUnit;
  courseId: string;
  topicId: string;
}

export function VideoItem({ video, courseId, topicId }: VideoItemProps) {
  const [open, setOpen] = useState(false);
  const { ref, isTruncated } = useIsTruncated<HTMLParagraphElement>();

  return (
    <>
      <div className="rounded-md border">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 mr-2">
            <Video className="h-5 w-5 text-muted-foreground shrink-0" />

            <div className="min-w-0">
              <Popover>
                <PopoverTrigger asChild>
                  <p
                    ref={ref}
                    className="
            text-sm font-medium
            line-clamp-2
            wrap-break-word
            cursor-pointer
          "
                  >
                    {video.title}
                  </p>
                </PopoverTrigger>

                {isTruncated && (
                  <PopoverContent
                    side="top"
                    align="start"
                    className="max-w-sm "
                  >
                    <p className="text-sm whitespace-normal wrap-break-word">
                      {video.title}
                    </p>
                  </PopoverContent>
                )}
              </Popover>

              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{video.video_provider}</span>

                {video.duration_minutes && (
                  <>
                    <span>·</span>
                    <span>{video.duration_minutes} min</span>
                  </>
                )}

                {video.is_free_preview && (
                  <>
                    <span>·</span>
                    <span className="text-green-600">Free preview</span>
                  </>
                )}
                {!video.is_published && (
                  <>
                    <span>·</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      Unpublished
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 w-28 lg:w-32 justify-between shrink-0">
            {/* Play toggle */}
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen((v) => !v)}
            >
              <Play className="mr-1 h-4 w-4" />
              {open ? "Hide" : "Play"}
            </Button>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="cursor-pointer">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="flex items-center flex-col"
              >
                <DropdownMenuItem asChild>
                  <ConfirmActionDialog
                    title={
                      video.is_published ? "Unpublish video?" : "Publish video?"
                    }
                    description={
                      video.is_published
                        ? "This video will no longer be visible to students."
                        : "This video will become visible to students."
                    }
                    confirmLabel={video.is_published ? "Unpublish" : "Publish"}
                    onConfirm={async () => {
                      try {
                        await toggleCourseUnitPublish({
                          courseId,
                          unitId: video.id,
                          publish: !video.is_published,
                        });
                        toast.success(
                          video.is_published
                            ? "Video unpublished"
                            : "Video published",
                        );
                      } catch (err) {
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Failed to publish video",
                        );
                      }
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start cursor-pointer w-full"
                      >
                        {video.is_published ? <>Unpublish</> : <>Publish</>}
                      </Button>
                    }
                  />
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <EditVideoDialog courseId={courseId} video={video} />
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <DeleteVideoDialog
                    courseId={courseId}
                    topicId={topicId}
                    videoId={video.id}
                    videoTitle={video.title}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Player */}
        {open && (
          <div className="border-t p-3">
            <VideoEmbed
              provider={video.video_provider}
              url={video.content_url}
            />
          </div>
        )}
      </div>

      {/* Delete dialog */}
    </>
  );
}
