"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { SectionReviewSummary } from "../types/question-details.types";
import { secondsToDurationString } from "@/src/lib/helper-functions/seconds-to-duration-string";

type Props = {
  summary: SectionReviewSummary;
};

function Item({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border p-3 space-y-1 relative">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      <div className={`text-base font-semibold ${tone ?? ""}`}>{value}</div>

      {hint ? (
        <div className="text-xs text-muted-foreground leading-tight">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function SectionSummaryAccordion({ summary }: Props) {
  const accuracy =
    summary.attemptedQuestions === 0
      ? 0
      : Math.round(
          (summary.correctQuestions / summary.attemptedQuestions) * 100,
        );

  return (
    <Accordion type="single" collapsible className="w-full pt-2">
      <div className="rounded-xl border px-3">
        <AccordionItem value="performance" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">
                Section Performance Summary
              </span>

              <span className="text-xs text-muted-foreground">
                Score {summary.earnedMarks}/{summary.totalPossibleMarks} •{" "}
                {summary.correctQuestions} correct • {accuracy}% accuracy
              </span>
            </div>
          </AccordionTrigger>

          {/* scrollable content */}
          <AccordionContent className="pb-3">
            <div className="max-h-105 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Item
                  label="Score"
                  value={`${summary.earnedMarks} / ${summary.totalPossibleMarks}`}
                  hint="Marks earned in this section"
                />

                <Item
                  label="Marks Missed"
                  value={summary.lostMarks}
                  hint="Includes unearned marks + negative marking deductions"
                />

                <Item
                  label="Negative Penalty"
                  value={summary.negativePenalty}
                  hint="Marks deducted for wrong answers"
                />

                <Item
                  label="Correct Answers"
                  value={summary.correctQuestions}
                  hint="Fully correct responses"
                  tone="text-green-600"
                />

                <Item
                  label="Partially Correct"
                  value={summary.partiallyCorrectQuestions}
                  hint="Received partial marks"
                  tone="text-amber-600"
                />

                <Item
                  label="Wrong Answers"
                  value={summary.wrongQuestions}
                  hint="Attempted but incorrect"
                  tone="text-red-600"
                />

                <Item
                  label="Unanswered"
                  value={summary.unansweredQuestions}
                  hint="Questions not attempted"
                />

                <Item
                  label="Attempted"
                  value={summary.attemptedQuestions}
                  hint="Questions answered by student"
                />

                <Item
                  label="Accuracy"
                  value={`${accuracy}%`}
                  hint="Correct ÷ attempted"
                />
              </div>
              <div className="mt-4 rounded-xl border bg-muted/5 px-4 py-3">
                <div className="text-sm font-medium">Time Spent Answering</div>

                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  You spent{" "}
                  <span className="font-medium text-foreground">
                    {secondsToDurationString(summary.totalTimeSpentSeconds)}
                  </span>{" "}
                  answering questions in this section. Time spent viewing
                  questions without submitting an answer is not included.
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  );
}
