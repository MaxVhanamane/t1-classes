"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/src/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import type { SectionTemplate } from "../../types/section-template.types";
import { SectionTemplateCard } from "./section-template-card";
import { getSectionTemplates } from "../../server/sections/get-section-templates";
import { addTestSectionFromTemplate } from "../../actions/sections/add-test-section";
import { TestType } from "../../../../create/_features/types/create-test.types";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: string;
  testType: TestType;
}

/**
 * Predefined Subjects for Classes 8–12 and Competitive Exams
 */
export const SUBJECT_OPTIONS = [
  // Core Subjects (Classes 11–12 and Competitive Exams)
  { label: "Mathematics", value: "mathematics" },
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
];

export function SectionTemplateSheet({
  open,
  onOpenChange,
  testId,
  testType,
}: Props) {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [selected, setSelected] = useState<SectionTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subject, setSubject] = useState("");

  // Scoring rule
  const [scoringMode, setScoringMode] = useState<"all" | "best">("all");
  const [bestCount, setBestCount] = useState("");

  const isStandard = testType === "standard";
  const isNumerical = selected?.answerMode === "numerical_input";

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    getSectionTemplates()
      .then(setTemplates)
      .catch(() => {
        toast.error("Failed to load section templates");
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleCreate = async () => {
    if (!selected || !subject) return;

    let scoringCount: number | null = null;

    if (isNumerical && scoringMode === "best") {
      const n = Number(bestCount);
      if (!n || n < 1) {
        toast.error("Enter a valid number of questions to score");
        return;
      }
      scoringCount = n;
    }

    setSubmitting(true);
    const toastId = toast.loading("Adding section…");

    const { error } = await callServerAction(
      addTestSectionFromTemplate(testId, selected.id, subject, scoringCount),
    );

    if (error) {
      toast.error(error, { id: toastId });
      setSubmitting(false);
      return;
    }

    toast.success("Section added", { id: toastId });

    // Reset UI
    setSubject("");
    setSelected(null);
    setScoringMode("all");
    setBestCount("");
    setSubjectOpen(false);
    onOpenChange(false);
    setSubmitting(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl px-2 overflow-y-auto pb-10"
        >
          <SheetHeader>
            <SheetTitle>Select section type</SheetTitle>
            <SheetDescription>
              Choose how questions in this section will be evaluated.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              templates.map((t) => (
                <SectionTemplateCard
                  key={t.id}
                  template={t}
                  selected={selected?.id === t.id}
                  onSelect={() => setSelected(t)}
                  disabled={isStandard && t.answerMode !== "single_select"}
                  disabledReason="Available only for sectioned tests"
                />
              ))
            )}
          </div>

          <div className="mt-6">
            <Button
              className="w-full"
              disabled={!selected || submitting}
              onClick={() => setSubjectOpen(true)}
            >
              Continue
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Subject + Scoring Dialog */}
      <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Section Settings</DialogTitle>
            <DialogDescription>
              Select the subject for this section to organize the test structure
              clearly for students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Subject Dropdown */}
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_OPTIONS.map((subj) => (
                    <SelectItem key={subj.value} value={subj.value}>
                      {subj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scoring Rules */}
            {isNumerical && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Scoring Rule</div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={scoringMode === "all"}
                    onChange={() => setScoringMode("all")}
                  />
                  Score all questions
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={scoringMode === "best"}
                    onChange={() => setScoringMode("best")}
                  />
                  Score best
                  <input
                    type="number"
                    min={1}
                    className="w-20 border rounded px-2 py-1"
                    value={bestCount}
                    disabled={scoringMode !== "best"}
                    onChange={(e) => setBestCount(e.target.value)}
                  />
                  questions
                </label>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!subject || submitting}
              onClick={handleCreate}
            >
              Create Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
