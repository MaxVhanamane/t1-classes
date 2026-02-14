"use client";

import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";

type Option = {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
};

export function OptionItem({ option }: { option: Option }) {
  const showCorrect = option.isCorrect;
  const showSelected = option.isSelected;

  const showBadges = showCorrect || showSelected;

  return (
    <div
      className={cn(
        "relative border rounded-xl p-3",

        showCorrect && "border-green-500 bg-green-500/10",

        showSelected && !showCorrect && "border-red-500 bg-red-500/10",
      )}
    >
      {/* Border-cut badges group */}
      {showBadges && (
        <div className="absolute right-2 top-0 -translate-y-1/2 z-10 flex gap-1">
          {/* Correct */}
          <div className="absolute right-2 top-0 -translate-y-1/2 z-10 flex gap-1">
            {/* Correct */}
            {showCorrect && (
              <Badge
                className={cn(
                  "h-5 px-2 text-xs border",

                  // Fully opaque surface
                  "bg-green-100 text-green-800 border-green-300",

                  // Dark mode solid surface
                  "dark:bg-background dark:text-green-500 dark:border-green-500",
                )}
              >
                Correct
              </Badge>
            )}

            {/* Your Answer */}
            {showSelected && (
              <Badge
                className={cn(
                  "h-5 px-2 text-xs border",

                  // Fully opaque yellow surface
                  "bg-amber-100 text-amber-800 border-amber-300",

                  // Dark mode solid surface
                  "dark:bg-background dark:text-white dark:border-white",
                )}
              >
                Your Answer
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Text row */}
      <div className="text-sm leading-relaxed wrap-break-word">
        <span className="font-medium mr-2">{option.label}.</span>

        {option.text}
      </div>
    </div>
  );
}
