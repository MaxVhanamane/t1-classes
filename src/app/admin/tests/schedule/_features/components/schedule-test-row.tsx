import { CalendarPlus, Layers, HelpCircle, Trophy } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { TestRow } from "../../../_features/types/test.types";

interface ScheduleTestRowProps {
  test: TestRow;
  onSchedule: (id: string) => void;
}

export function ScheduleTestRow({ test, onSchedule }: ScheduleTestRowProps) {
  return (
    // gap-4 creates the clear separation between the two groups
    <div className="flex flex-col gap-4 rounded-lg border p-4 transition hover:bg-muted/40 hover:shadow-sm">
      {/* === GROUP 1: HEADER (Title & Desc) === */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold">{test.title}</span>
          <Badge variant="outline" className="capitalize text-xs">
            {test.test_type}
          </Badge>
        </div>

        {test.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {test.description}
          </p>
        )}
      </div>

      {/* === GROUP 2: METADATA & ACTIONS (Equally Spaced with gap-2.5) === */}
      <div className="flex flex-col gap-2.5">
        {/* 1. Stats Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {test.test_type === "sectioned" && (
            <div className="flex items-center gap-1.5">
              <Layers className="size-4 text-sky-500" />
              <span>
                {test.total_sections}{" "}
                {test.total_sections === 1 ? "Section" : "Sections"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <HelpCircle className="size-4 text-emerald-500" />
            <span>
              {test.total_questions}{" "}
              {test.total_questions === 1 ? "Question" : "Questions"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Trophy className="size-4 text-amber-500" />
            <span>{test.total_marks} Marks</span>
          </div>
        </div>

        {/* 2. Subjects List */}
        {test.subject_labels && test.subject_labels.length > 0 && (
          <div
            className="truncate text-xs font-medium capitalize text-foreground"
            title={test.subject_labels.join(", ")}
          >
            <span className="font-normal text-muted-foreground">
              {test.subject_labels.length === 1 ? "Subject: " : "Subjects: "}
            </span>
            {test.subject_labels.join(", ")}
          </div>
        )}

        {/* 3. Dates & Actions Row (sm:-mt-1 optically fixes the button height stretch) */}
        <div className="flex flex-col gap-3 sm:-mt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:gap-x-3">
            <span className="whitespace-nowrap">
              Created{" "}
              {new Date(test.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            {test.created_by && (
              <>
                <span className="whitespace-nowrap">•</span>
                <span
                  className="truncate max-w-[160px] sm:max-w-[250px]"
                  title={`By ${test.created_by.full_name}`}
                >
                  By {test.created_by.full_name}
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            {/* h-8 keeps the button compact so it matches the text line height cleanly */}
            <Button
              size="sm"
              variant="outline"
              className="flex h-8 items-center gap-2 px-3 text-xs"
              onClick={() => onSchedule(test.id)}
            >
              <CalendarPlus className="size-3.5" />
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
