"use client";

import { Card, CardContent } from "@/src/components/ui/card";

type TestOverviewProps = {
  test: {
    title: string;
    description: string | null;
    test_type: "standard" | "sectioned";
    total_marks: number;
    total_questions: number;
    total_sections: number;
  };
  distribution: {
    duration_minutes: number;
  };
  subjects: string[];
};

export function TestOverviewCard({
  test,
  distribution,
  subjects,
}: TestOverviewProps) {
  return (
    <Card className="relative overflow-hidden bg-background rounded-xl border shadow-sm py-2">
      <CardContent className="relative z-10 flex flex-col p-5 sm:p-6">
        {/* === TITLE & SUBTITLE === */}
        <div className="flex flex-col gap-1.5">
          {/* Using break-words instead of truncate so long titles are fully visible */}
          <h2 className="text-xl font-semibold tracking-tight text-foreground wrap-break-word">
            {test.title}
          </h2>
          {subjects.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {subjects.length === 1 ? "Subject: " : "Subjects: "}
              <span className="font-medium text-foreground">
                {subjects.join(" • ")}
              </span>
            </p>
          )}
        </div>

        {/* === METADATA GRID === */}
        <div className="mt-6 grid grid-cols-[auto_auto] justify-start gap-x-8 gap-y-3 sm:gap-x-12">
          {/* Duration */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium text-foreground">
              {distribution.duration_minutes} mins
            </span>
          </div>

          {/* Format */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Format:</span>
            <span className="font-medium capitalize text-foreground">
              {test.test_type}
            </span>
          </div>

          {/* Total Questions */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Questions:</span>
            <span className="font-medium text-foreground">
              {test.total_questions}
            </span>
          </div>

          {/* Total Sections (Only shown if sectioned) */}
          {test.test_type === "sectioned" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sections:</span>
              <span className="font-medium text-foreground">
                {test.total_sections}
              </span>
            </div>
          )}

          {/* Total Marks */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Total Marks:</span>
            <span className="font-medium text-foreground">
              {test.total_marks}
            </span>
          </div>
        </div>

        {/* === TEST DESCRIPTION (Plain Text with Line Breaks) === */}
        {test.description && (
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {test.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
