"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

import { QuestionPaperCategory } from "../../types/question-paper.types";

const tabs: {
  key: QuestionPaperCategory;
  label: string;
}[] = [
  {
    key: "previous_year",
    label: "Previous Year",
  },
  {
    key: "practice",
    label: "Practice",
  },
];

type Props = {
  value: QuestionPaperCategory;

  onChange: (value: QuestionPaperCategory) => void;

  onRefresh: () => void;

  isRefreshing: boolean;
};

export function QuestionPapersTabs({
  value,
  onChange,
  onRefresh,
  isRefreshing,
}: Props) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={value === tab.key ? "default" : "outline"}
            className="h-8 w-28 shrink-0 text-xs sm:h-9 sm:w-32 sm:text-sm"
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </Button>
        ))}

        <Button
          size="icon"
          variant="outline"
          className="size-8 shrink-0 sm:size-9"
          onClick={onRefresh}
        >
          <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
