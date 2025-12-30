"use client";

import { useState } from "react";
import { FileText, Loader, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/src/components/ui/drawer";

import { PdfUnit } from "../../types/course-unit.types";
import { getPdfSignedUrl } from "../../actions/topic/pdf/get-signed-pdf-url";
import { EditPdfDialog } from "./edit-pdf-dialog";
import { DeletePdfDialog } from "./delete-pdf-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { useIsTruncated } from "@/src/hooks/useIsTruncated";
import { ConfirmActionDialog } from "@/src/components/ui/common/confirm-action-dialog";
import { toggleCourseUnitPublish } from "../../actions/topic/toggleCourseUnitPublish";

interface Props {
  pdf: PdfUnit;
  courseId: string;
  topicId: string;
}

export function PdfItem({ pdf, courseId, topicId }: Props) {
  const [opening, setOpening] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const { ref, isTruncated } = useIsTruncated<HTMLParagraphElement>();

  async function handleOpen() {
    if (opening || !pdf.file_path) return;

    setOpening(true);

    try {
      const url = await getPdfSignedUrl(pdf.file_path);
      setSignedUrl(url);
      setOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open PDF");
    } finally {
      setOpening(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSignedUrl(null); // revoke access
  }

  return (
    <>
      {/* List item */}
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="flex items-center gap-3 mr-2">
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />

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
                  {pdf.title}
                </p>
              </PopoverTrigger>

              {isTruncated && (
                <PopoverContent side="top" align="start" className="max-w-xs">
                  <p className="text-sm whitespace-normal wrap-break-word">
                    {pdf.title}
                  </p>
                </PopoverContent>
              )}
            </Popover>

            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>PDF</span>

              {pdf.duration_minutes && (
                <>
                  <span>·</span>
                  <span>{pdf.duration_minutes} min</span>
                </>
              )}

              {pdf.is_free_preview && (
                <>
                  <span>·</span>
                  <span className="text-green-600">Free preview</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 w-32 justify-between shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpen}
            disabled={opening}
            className="w-20 cursor-pointer"
          >
            {!opening && <FileText className="h-4 w-4 mr-1" />}

            {opening ? <Loader className="animate-spin w-4 h-4 " /> : "Open"}
          </Button>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="flex gap-1 flex-col">
              <DropdownMenuItem asChild>
                <ConfirmActionDialog
                  title={pdf.is_published ? "Unpublish pdf?" : "Publish pdf?"}
                  description={
                    pdf.is_published
                      ? "This pdf will no longer be visible to students."
                      : "This pdf will become visible to students."
                  }
                  confirmLabel={pdf.is_published ? "Unpublish" : "Publish"}
                  onConfirm={async () => {
                    try {
                      await toggleCourseUnitPublish({
                        courseId,
                        unitId: pdf.id,
                        publish: !pdf.is_published,
                      });
                      toast.success(
                        pdf.is_published ? "pdf unpublished" : "pdf published"
                      );
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to publish pdf"
                      );
                    }
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start cursor-pointer w-full"
                    >
                      {pdf.is_published ? <>Unpublish</> : <>Publish</>}
                    </Button>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <EditPdfDialog
                  pdf={pdf}
                  courseId={courseId}
                  topicId={topicId}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DeletePdfDialog
                  courseId={courseId}
                  topicId={topicId}
                  pdfId={pdf.id}
                  pdfTitle={pdf.title}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Drawer Preview */}
      <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
        <DrawerContent
          className="
            fixed
            inset-y-0
            right-0
            w-full
            lg:max-w-[70vw]
          "
        >
          <DrawerHeader className="border-b">
            <DrawerTitle>{pdf.title}</DrawerTitle>
          </DrawerHeader>

          <div className="h-full">
            {!signedUrl ? (
              <div className="flex h-full items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <iframe
                src={signedUrl}
                className="h-full w-full border-0"
                title={pdf.title}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
