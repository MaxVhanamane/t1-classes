"use client";

import { cn } from "@/src/lib/utils";
import { JSONContent } from "@tiptap/react";
import { Badge } from "@/src/components/ui/badge";
import { RichTextRenderer } from "@/src/app/admin/tests/[testId]/sections/[sectionId]/_features/components/questions/rich-text-renderer";

type Option = {
  id: string;
  label: string;
  text: JSONContent;
  isCorrect: boolean;
  isSelected: boolean;
};

export function OptionItem({ option }: { option: Option }) {
  const showCorrect = option.isCorrect;

  const showSelected = option.isSelected;

  const showBadges = showCorrect || showSelected;

  const wrongSelection = showSelected && !showCorrect;

  return (
    <div
      className={cn(
        "relative rounded-lg border px-4 py-3 transition-colors",

        "bg-background",

        showCorrect &&
          "border-green-300 bg-green-50/60 dark:border-green-800 dark:bg-green-950/20",

        wrongSelection &&
          "border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-950/20",
      )}
    >
      {/* Border-cut badges group (UNCHANGED) */}
      {showBadges && (
        <div className="absolute right-2 top-0 -translate-y-1/2 z-10 flex gap-1">
          <div className="absolute right-2 top-0 -translate-y-1/2 z-10 flex gap-1">
            {showCorrect && (
              <Badge
                className={cn(
                  "h-5 px-2 text-xs border",

                  "bg-green-100 text-green-800 border-green-300",

                  "dark:bg-background dark:text-green-500 dark:border-green-500",
                )}
              >
                Correct
              </Badge>
            )}

            {showSelected && (
              <Badge
                className={cn(
                  "h-5 px-2 text-xs border",

                  "bg-amber-100 text-amber-800 border-amber-300",

                  "dark:bg-background dark:text-white dark:border-white",
                )}
              >
                Your Answer
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",

            showCorrect &&
              "border-green-300 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300",

            wrongSelection &&
              "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300",

            !showCorrect &&
              !wrongSelection &&
              "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {option.label}
        </div>

        <div className="min-w-0 pt-0.5 text-sm leading-relaxed text-foreground">
          <RichTextRenderer content={option.text} />
        </div>
      </div>
    </div>
  );
}
