"use client";

import { Eye, Loader, FileText, Info } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import {
  SUBJECT_LABELS,
  TARGET_EXAM_LABELS,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

import { formatFileSize } from "@/src/app/admin/question-papers/_features/helper-functions/helpers";

import DottedBackground from "@/src/components/dotted-background";
import { cn } from "@/src/lib/utils";

type QuestionPaperCardProps = {
  questionPaper: {
    id: string;
    title: string;
    targetExam: string | null;
    subject: string | null;
    paperCategory: "previous_year" | "practice";
    years: number[];
    classLevel: number | null;
    description: string | null;
    fileSize: number | null;
  };

  onView: () => void;

  isLoading?: boolean;

  layout?: "batch" | "course";
};

export function QuestionPaperCard({
  questionPaper,
  onView,
  isLoading = false,
  layout = "batch",
}: QuestionPaperCardProps) {
  const hasDescription = !!questionPaper.description?.trim();

  return (
    <Card className="relative dark:bg-black py-4">
      <DottedBackground />

      <CardContent
        className={
          layout === "course"
            ? "flex flex-col gap-4 p-4"
            : "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
        }
      >
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-md p-2">
              <FileText className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h3 className="line-clamp-2 font-medium">
                  {questionPaper.title}
                </h3>

                {hasDescription && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 shrink-0"
                      >
                        <Info className="size-4" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent align="start" className="max-w-sm">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Description</h4>

                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                          {questionPaper.description}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {hasDescription && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {questionPaper.description}
                </p>
              )}

              <p className="text-muted-foreground mt-1 text-sm">
                PDF
                {questionPaper.fileSize &&
                  ` • ${formatFileSize(questionPaper.fileSize)}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* <Badge variant="secondary">
              {questionPaper.paperCategory === "previous_year"
                ? "Previous Year"
                : "Practice"}
            </Badge> */}

            {questionPaper.targetExam && (
              <Badge variant="outline">
                {
                  TARGET_EXAM_LABELS[
                    questionPaper.targetExam as keyof typeof TARGET_EXAM_LABELS
                  ]
                }
              </Badge>
            )}

            {questionPaper.subject && (
              <Badge variant="outline">
                {
                  SUBJECT_LABELS[
                    questionPaper.subject as keyof typeof SUBJECT_LABELS
                  ]
                }
              </Badge>
            )}

            {questionPaper.classLevel && (
              <Badge variant="outline">Class {questionPaper.classLevel}</Badge>
            )}

            {questionPaper.years?.length > 0 && (
              <Badge variant="outline">{questionPaper.years.join(", ")}</Badge>
            )}
          </div>
        </div>

        <Button
          onClick={onView}
          disabled={isLoading}
          className={cn("w-full mt-2", layout === "batch" && "sm:w-auto")}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Eye className="mr-2 size-4" />
              View PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
