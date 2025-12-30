"use client";

import { ClipboardList, Eye, EyeOff, MoreVertical } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { PracticeSetDialog } from "./practice-set-dialog";
import { DeletePracticeSetDialog } from "../../practice/[practiceSetId]/components/delete-practice-set-confirmation-dialog";
import { ConfirmActionDialog } from "@/src/components/ui/common/confirm-action-dialog";
import { togglePracticeSetPublish } from "../../actions/practice-set/togglePracticeSetPublish";
import { toast } from "sonner";

interface Props {
  practiceSet: {
    id: string;
    title: string;
    description: string | null;
    is_published: boolean;
  };
  courseId: string;
  topicId: string;
}

export function PracticeSetItem({ practiceSet, courseId, topicId }: Props) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />

        <div>
          <p className="text-sm font-medium">{practiceSet.title}</p>
          {practiceSet.description && (
            <p className="text-xs text-muted-foreground">
              {practiceSet.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 w-32 justify-between">
        {/* Open */}
        <Button size="sm" variant="outline" asChild>
          <Link
            href={`/admin/curriculum/${courseId}/topics/${topicId}/practice/${practiceSet.id}`}
          >
            Open
          </Link>
        </Button>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="flex flex-col p-2 ">
            <DropdownMenuItem asChild>
              <ConfirmActionDialog
                title={
                  practiceSet.is_published
                    ? "Unpublish practice set?"
                    : "Publish practice set?"
                }
                description={
                  practiceSet.is_published
                    ? "This practice set will no longer be visible to students."
                    : "This practice set will become visible to students."
                }
                confirmLabel={
                  practiceSet.is_published ? "Unpublish" : "Publish"
                }
                onConfirm={async () => {
                  try {
                    await togglePracticeSetPublish({
                      courseId,
                      practiceSetId: practiceSet.id,
                      publish: !practiceSet.is_published,
                    });
                    toast.success(
                      practiceSet.is_published
                        ? "practice set unpublished"
                        : "practice set published"
                    );
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Failed to publish practice set"
                    );
                  }
                }}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start cursor-pointer w-full"
                  >
                    {practiceSet.is_published ? (
                      <>
                        <EyeOff className="h-4 w-4 " /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 " /> Publish
                      </>
                    )}
                  </Button>
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <PracticeSetDialog
                mode="edit"
                courseId={courseId}
                topicId={topicId}
                initialData={{
                  practiceSetId: practiceSet.id,
                  title: practiceSet.title,
                  description: practiceSet.description,
                }}
              />
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <DeletePracticeSetDialog
                courseId={courseId}
                practiceSetId={practiceSet.id}
                topicId={topicId}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
