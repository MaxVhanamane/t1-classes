"use client";

import { useState } from "react";
import { Layers } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

import { useBatchesIncludingInactive } from "@/src/hooks/use-batches-including-inactive";
import { useCourseOptions } from "@/src/hooks/use-course-options";
import { useSyllabusProgress } from "../hooks/use-syllabus-progress";

import { ImportCourseDialog } from "./import-course-dialog";
import { CreateSectionDialog } from "./create-section-dialog";
import { CreateChapterDialog } from "./create-chapter-dialog";
import { EditTitleDialog } from "./edit-title-dialog";
import { DashboardStatsCard } from "./dashboard-stats-card";
import { SyllabusTabs } from "./syllabus-tabs";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import DottedBackground from "@/src/components/dotted-background";

export function SyllabusProgressClient() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Dialog States
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);

  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    title: string;
    type: "section" | "chapter";
  } | null>(null);

  // Queries
  const { data: batches = [], isLoading: isLoadingBatches } =
    useBatchesIncludingInactive();
  const { data: courses = [] } = useCourseOptions();

  // Added isFetching to track background re-validations
  const {
    data: syllabusData,
    isLoading: isLoadingSyllabus,
    isFetching: isFetchingSyllabus,
    refetch,
  } = useSyllabusProgress(selectedBatchId);

  const sections = syllabusData?.items ?? [];
  const batchMeta = syllabusData?.batch;
  const isAdmin = syllabusData?.isAdmin ?? false;

  // Global Stats
  const allChapters = sections.flatMap((s) => s.chapters ?? []);
  const totalChapters = allChapters.length;

  const completedChapters = allChapters.filter(
    (c) => c.status === "completed",
  ).length;

  // NEW: Calculate how many chapters are verified globally
  const verifiedChapters = allChapters.filter(
    (c) => c.verified_at != null,
  ).length;

  const overallPercent =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // Handlers
  const handleOpenImport = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setIsImportOpen(true);
  };
  const handleOpenCreateChapter = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setIsCreateChapterOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto pb-24">
      {/* Header & Select */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            Syllabus Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Monitor teaching progress and verify chapter completions.
          </p>
        </div>

        <div className="w-full md:w-[320px]">
          {isLoadingBatches ? (
            <Skeleton className="flex items-center h-9 w-full rounded-lg px-4 border border-border/60">
              <span className="text-muted-foreground text-base">
                Loading batches...
              </span>
            </Skeleton>
          ) : (
            <Select
              value={selectedBatchId ?? ""}
              onValueChange={setSelectedBatchId}
            >
              <SelectTrigger className="w-full bg-background border-border/60 shadow-none rounded-lg text-base">
                <SelectValue placeholder="Select a batch..." />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem
                    key={batch.id}
                    value={batch.id}
                    className="py-2.5"
                  >
                    {batch.title}{" "}
                    {!batch.is_active && (
                      <span className="text-muted-foreground text-xs ml-1">
                        (Inactive)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Dashboard Canvas */}
      <div className="mt-8">
        {!selectedBatchId ? (
          <div className="flex flex-col items-center justify-center py-32 text-center fade-in border border-border border-dashed rounded-xl bg-card relative">
            <DottedBackground />
            <div className="bg-muted-soft p-5 rounded-2xl border border-border/40 mb-5 z-10">
              <Layers className="size-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground tracking-tight">
              No Batch Selected
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2 leading-relaxed">
              Select a batch from the dropdown above to view the syllabus and
              track pacing.
            </p>
          </div>
        ) : isLoadingSyllabus ? (
          // Fixed positioning: centered in a large container rather than squished at the top
          <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
            <LoadingIndicator message="Loading syllabus..." />
          </div>
        ) : (
          // Apply opacity and pointer-events reduction during background refetching
          <div
            className={cn(
              "space-y-8 animate-in fade-in duration-500 transition-opacity",
              isFetchingSyllabus &&
                !isLoadingSyllabus &&
                "opacity-60 pointer-events-none",
            )}
          >
            <DashboardStatsCard
              batchMeta={batchMeta}
              totalChapters={totalChapters}
              completedChapters={completedChapters}
              verifiedChapters={verifiedChapters}
              overallPercent={overallPercent}
              isAdmin={isAdmin}
              onAddSection={() => setIsCreateSectionOpen(true)}
            />

            <SyllabusTabs
              sections={sections}
              selectedBatchId={selectedBatchId}
              isAdmin={isAdmin}
              onEditSection={(sec) =>
                setEditTarget({ id: sec.id, title: sec.title, type: "section" })
              }
              onEditChapter={(chap) =>
                setEditTarget({
                  id: chap.id,
                  title: chap.title,
                  type: "chapter",
                })
              }
              onAddChapter={handleOpenCreateChapter}
              onImportCourse={handleOpenImport}
              onAddFirstSection={() => setIsCreateSectionOpen(true)}
              onRefresh={refetch}
            />
          </div>
        )}
      </div>

      {/* Shared Modals */}
      {selectedBatchId && (
        <>
          <CreateSectionDialog
            open={isCreateSectionOpen}
            onOpenChange={setIsCreateSectionOpen}
            batchId={selectedBatchId}
            onSuccess={refetch}
          />
          {targetSectionId && (
            <>
              <ImportCourseDialog
                open={isImportOpen}
                onOpenChange={(o) => {
                  setIsImportOpen(o);
                  if (!o) setTargetSectionId(null);
                }}
                batchId={selectedBatchId}
                sectionId={targetSectionId}
                courses={courses}
                onSuccess={refetch}
              />
              <CreateChapterDialog
                open={isCreateChapterOpen}
                onOpenChange={(o) => {
                  setIsCreateChapterOpen(o);
                  if (!o) setTargetSectionId(null);
                }}
                batchId={selectedBatchId}
                sectionId={targetSectionId}
                onSuccess={refetch}
              />
            </>
          )}
        </>
      )}

      <EditTitleDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        target={editTarget}
        onSuccess={refetch}
      />
    </div>
  );
}
