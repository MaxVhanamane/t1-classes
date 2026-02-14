"use client";

import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

import { SectionTemplateSheetTrigger } from "./section-template-sheet-trigger";
import { TestSection } from "../../types/test-section.types";

import { Trash2 } from "lucide-react";
import { deleteSection } from "../../actions/sections/delete-section";

interface Props {
  testId: string;
  testType: "standard" | "sectioned";
  sections: TestSection[];
}

export function TestSectionsList({ testId, testType, sections }: Props) {
  const router = useRouter();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestSection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isStandard = testType === "standard";
  const hasSectionAlready = sections.length > 0;
  const disableAddSection = isStandard && hasSectionAlready;

  const handleDisabledClick = () => {
    toast.info(
      "Standard tests can have only one section. Use a sectioned test to add more.",
    );
  };

  const goToSection = (sectionId: string) => {
    router.push(`/admin/tests/${testId}/sections/${sectionId}`);
  };

  const toggleDescription = (sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteSection(testId, deleteTarget.id);

      toast.success("Section deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete section");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sections</h2>

          {disableAddSection ? (
            <Button variant="secondary" onClick={handleDisabledClick}>
              Add Section
            </Button>
          ) : (
            <SectionTemplateSheetTrigger testId={testId} testType={testType}>
              <Button>Add Section</Button>
            </SectionTemplateSheetTrigger>
          )}
        </div>

        {/* Sections list */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              onClick={() => goToSection(section.id)}
              className="p-4 cursor-pointer transition hover:border-primary/50 hover:bg-muted/40 shadow-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium">
                    Section {index + 1}: {section.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline">
                      {section.answerMode.replace("_", " ")}
                    </Badge>

                    <span>
                      <span className="font-medium text-foreground">
                        Correct
                      </span>
                      : +{section.fullMarks}
                    </span>

                    {section.negativeMarks < 0 && (
                      <span>
                        <span className="font-medium text-foreground">
                          Incorrect
                        </span>
                        : {section.negativeMarks}
                      </span>
                    )}

                    {section.partialMarks && (
                      <span className="italic text-muted-foreground">
                        Partial marking enabled
                      </span>
                    )}
                    {section.subjectLabel && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Subject:
                        </span>{" "}
                        {section.subjectLabel}
                      </div>
                    )}

                    {section.answerMode === "numerical_input" && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Scoring:
                        </span>{" "}
                        {section.scoringQuestionCount
                          ? `Best ${section.scoringQuestionCount} questions count`
                          : "All questions count"}
                      </div>
                    )}
                  </div>

                  {/* Expand Toggle */}
                  {section.description && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(section.id);
                      }}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      {expandedSection === section.id
                        ? "Hide Description"
                        : "Show Description"}
                    </button>
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(section);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Expandable Description */}
              {expandedSection === section.id && section.description && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this section and all questions inside
              it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
