"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";

import { ResultSummary, SectionSidebar } from "./section-sidebar";
import { SectionItem } from "../hooks/use-get-sections";
import { MetaStrip } from "./meta-strip";
import { PartialMarkingByCorrectCount } from "@/src/app/api/tests/results/[attemptId]/sections/route";
import { SectionSummaryAccordion } from "./section-summary-accordion";
import { SectionReviewSummary } from "@/src/app/api/tests/results/[attemptId]/sections/[sectionId]/questions/route";
import { Skeleton } from "@/src/components/ui/skeleton";

type Props = {
  sections: SectionItem[];
  active: string | null;
  onChange: (id: string) => void;
  summary: ResultSummary;
  sectionTitle?: string;
  subjectLabel?: string;
  fullMarks?: number;
  negativeMarks?: number;
  partialMarks?: PartialMarkingByCorrectCount | null | undefined;
  questionCount?: number;
  currentPage?: number;
  totalPages?: number;
  sectionSummary: SectionReviewSummary | null;
  isSectionSummaryLoading: boolean;
};

export function MobileSectionDrawer({
  sections,
  active,
  onChange,
  summary,
  sectionTitle,
  subjectLabel,
  fullMarks,
  negativeMarks,
  partialMarks,
  questionCount,
  sectionSummary,
  isSectionSummaryLoading,
  currentPage = 1,
  totalPages = 1,
}: Props) {
  const [open, setOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="md:hidden border-b bg-background sticky top-0 z-20">
      {/* ===== Top Bar ===== */}
      <div className="flex items-center justify-between p-3">
        {/* Sections Drawer Button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline">
              <Menu className="h-4 w-4 mr-2" />
              Result & Sections
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-[90%]">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>Test Sections</SheetTitle>
            </SheetHeader>

            <div className="h-[calc(100vh-60px)] overflow-y-auto">
              <SectionSidebar
                sections={sections}
                active={active}
                onChange={(id) => {
                  onChange(id);
                  setSheetOpen(false);
                }}
                className="border-none"
                summary={summary}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Info Accordion Toggle */}
        <Button
          variant="ghost"
          size="bare"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          Section info
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* ===== Accordion Panel ===== */}
      {open && (
        <div className="px-4 pb-3 animate-in slide-in-from-top-2 fade-in duration-200">
          {sectionTitle && (
            <h2 className="text-sm font-semibold mb-1">{sectionTitle}</h2>
          )}

          <MetaStrip
            subjectLabel={subjectLabel}
            questionCount={questionCount}
            fullMarks={fullMarks}
            negativeMarks={negativeMarks}
            partialMarks={partialMarks}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {isSectionSummaryLoading ? (
            <SectionSummaryAccordionSkeleton />
          ) : sectionSummary ? (
            <SectionSummaryAccordion summary={sectionSummary} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function SectionSummaryAccordionSkeleton() {
  return (
    <div className="w-full pt-2">
      <div className="rounded-xl border px-3">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>

          <Skeleton className="h-4 w-4 shrink-0 rounded-sm -mt-2" />
        </div>
      </div>
    </div>
  );
}
