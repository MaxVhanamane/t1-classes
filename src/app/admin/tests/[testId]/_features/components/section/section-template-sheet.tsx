"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import {
  SUBJECTS,
  SUBJECT_LABELS,
  type Subject,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { Label } from "@/src/components/ui/label";

import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import { callServerAction } from "@/src/lib/actions/call-server-action";

import { addTestSectionFromTemplate } from "../../actions/sections/add-test-section";

import { useSectionTemplates } from "../../hooks/use-section-templates";

import type { SectionTemplate } from "../../types/section-template.types";

import type { TestType } from "../../../../create/_features/types/create-test.types";

import { SectionTemplateCard } from "./section-template-card";

interface Props {
  open: boolean;

  onOpenChange: (v: boolean) => void;

  testId: string;

  testType: TestType;
}

export function SectionTemplateSheet({
  open,
  onOpenChange,
  testId,
  testType,
}: Props) {
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    error: templatesError,
  } = useSectionTemplates(open);

  const [selected, setSelected] = useState<SectionTemplate | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [subjectOpen, setSubjectOpen] = useState(false);

  const [subject, setSubject] = useState<Subject | "">("");

  const isStandard = testType === "standard";

  async function handleCreate() {
    if (!selected || !subject) {
      return;
    }

    setSubmitting(true);

    const toastId = toast.loading("Adding section...");

    const { error } = await callServerAction(
      addTestSectionFromTemplate(testId, selected.id, subject),
    );

    if (error) {
      toast.error(error, {
        id: toastId,
      });

      setSubmitting(false);

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["admin", "tests", testId, "details"],
    });

    toast.success("Section added", {
      id: toastId,
    });

    setSubject("");

    setSelected(null);

    setSubjectOpen(false);

    onOpenChange(false);

    setSubmitting(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          <SheetHeader className="border-b px-6 py-3">
            <SheetTitle>Select Section Type</SheetTitle>

            <SheetDescription>
              Choose how questions in this section will be evaluated.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingIndicator />
              </div>
            ) : templatesError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load section templates.
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <SectionTemplateCard
                    key={template.id}
                    template={template}
                    selected={selected?.id === template.id}
                    onSelect={() => setSelected(template)}
                    disabled={
                      isStandard && template.answerMode !== "single_select"
                    }
                    disabledReason="Sectioned tests only"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-background/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
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

      <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Section Settings</DialogTitle>

            <DialogDescription>
              Select the subject for this section.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subject</Label>

              <Select
                value={subject}
                onValueChange={(value) => setSubject(value as Subject)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>

                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {SUBJECT_LABELS[subject]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              disabled={!subject || submitting}
              onClick={handleCreate}
            >
              {submitting ? "Creating Section..." : "Create Section"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
