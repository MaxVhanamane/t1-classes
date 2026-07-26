"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  FolderDown,
  MoreVertical,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
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

import type {
  SyllabusSectionRow,
  SyllabusChapterRow,
} from "../types/syllabus-progress.types";
import { ChapterRowItem } from "./chapter-row-item";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { deleteSection } from "../actions/delete-section";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface SyllabusTabsProps {
  sections: SyllabusSectionRow[];
  selectedBatchId: string;
  isAdmin: boolean;
  onEditSection: (section: SyllabusSectionRow) => void;
  onEditChapter: (chapter: SyllabusChapterRow) => void;
  onAddChapter: (sectionId: string) => void;
  onImportCourse: (sectionId: string) => void;
  onAddFirstSection: () => void;
  onRefresh: () => void;
}

export function SyllabusTabs({
  sections,
  selectedBatchId,
  isAdmin,
  onEditSection,
  onEditChapter,
  onAddChapter,
  onImportCourse,
  onAddFirstSection,
  onRefresh,
}: SyllabusTabsProps) {
  // Tab State Management
  const [activeTab, setActiveTab] = useState<string | undefined>(
    sections[0]?.id,
  );

  // Standard React state-derived tracking to detect new sections without refs
  const [prevSectionsLength, setPrevSectionsLength] = useState(sections.length);

  if (sections.length > prevSectionsLength) {
    setPrevSectionsLength(sections.length);
    const latestSection = sections[sections.length - 1];
    if (latestSection) {
      setActiveTab(latestSection.id);
    }
  } else if (sections.length < prevSectionsLength) {
    setPrevSectionsLength(sections.length);
  }

  // DERIVED STATE: Fallback if current activeTab is deleted or invalid
  const effectiveTab = sections.some((s) => s.id === activeTab)
    ? activeTab
    : sections[0]?.id;

  // Delete Section State
  const [sectionToDelete, setSectionToDelete] =
    useState<SyllabusSectionRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deleting section...");

    const { error } = await callServerAction(
      deleteSection({ section_id: sectionToDelete.id }),
    );

    setIsDeleting(false);
    setSectionToDelete(null);

    if (error) {
      toast.error(error, { id: toastId });
      return;
    }

    toast.success("Section deleted permanently", { id: toastId });
    onRefresh();
  };

  // Handle empty state (0 tabs left)
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-background/50">
        <BookOpen className="size-10 text-muted-foreground/40 mb-4" />
        <h4 className="text-lg font-medium text-foreground">
          Syllabus is empty
        </h4>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Start building the syllabus by adding a section.
        </p>
        {isAdmin && (
          <Button onClick={onAddFirstSection} variant="outline">
            Add First Section
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Tabs
        key={selectedBatchId}
        value={effectiveTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1.5 bg-muted/60 rounded-xl mb-6 custom-scrollbar">
          {sections.map((sec) => (
            <TabsTrigger
              key={sec.id}
              value={sec.id}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 max-w-45 shrink-0"
              title={sec.title}
            >
              <span className="truncate font-medium">{sec.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => {
          const secChapters = section.chapters ?? [];
          const secCompleted = secChapters.filter(
            (c) => c.status === "completed",
          ).length;

          const secVerified = secChapters.filter((c) => c.verified_at).length;
          const verifiedPercent =
            secChapters.length > 0
              ? Math.round((secVerified / secChapters.length) * 100)
              : 0;

          return (
            <TabsContent
              key={section.id}
              value={section.id}
              className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0"
            >
              {/* Elevated Section Header */}
              <div className="relative bg-card flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-6 rounded-xl overflow-hidden border border-border">
                {/* Title & Actions */}
                <div className="flex items-center gap-3 min-w-0 w-full md:w-auto pl-2">
                  <h2
                    className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate"
                    title={section.title}
                  >
                    {section.title}
                  </h2>

                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors shrink-0"
                        >
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                          onClick={() => onEditSection(section)}
                          className="cursor-pointer"
                        >
                          <Pencil className="size-4 mr-2" />
                          Edit Title
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSectionToDelete(section)}
                          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete Section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Badges & Course Actions Section */}
                <div className="flex items-center flex-wrap gap-3 pl-2 md:pl-0">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 text-xs font-medium bg-muted/50 border-border/50 text-muted-foreground"
                  >
                    <span className="text-foreground font-semibold mr-1">
                      {secCompleted}
                    </span>
                    / {secChapters.length} Done
                  </Badge>

                  {secChapters.length > 0 && (
                    <Badge
                      variant="outline"
                      className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                        verifiedPercent === 100
                          ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400"
                          : "bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-500"
                      }`}
                    >
                      <ShieldCheck className="size-3.5" />
                      <span className="font-semibold">{verifiedPercent}%</span>
                      <span className="inline">Verified</span>
                      <span className="opacity-80">({secVerified})</span>
                    </Badge>
                  )}

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddChapter(section.id)}
                        className="h-8 rounded-lg shadow-sm bg-background border-dashed border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <Plus className="size-3.5 mr-1.5" />
                        <span className="inline">Create Chapter</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onImportCourse(section.id)}
                        className="h-8 rounded-lg shadow-sm bg-background border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <FolderDown className="size-3.5 mr-1.5" /> Import
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chapters List */}
              {secChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                  <div className="bg-muted p-3 rounded-2xl border border-border/50 shadow-sm mb-4">
                    <BookOpen className="size-6 text-muted-foreground/60" />
                  </div>
                  <h4 className="text-[15px] font-semibold text-foreground">
                    This section is empty
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-65 leading-relaxed">
                    Add custom chapters or import a course to begin tracking
                    progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {secChapters.map((chapter) => (
                    <ChapterRowItem
                      key={chapter.id}
                      chapter={chapter}
                      isAdmin={isAdmin}
                      onEditTitle={onEditChapter}
                      onRefresh={onRefresh}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Delete Section Confirmation Dialog */}
      <AlertDialog
        open={Boolean(sectionToDelete)}
        onOpenChange={(open) => !open && setSectionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" /> Delete Section
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              Are you sure you want to permanently delete the section{" "}
              <strong>{sectionToDelete?.title}</strong>? This will erase all
              chapters, progress, and verification history inside it. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDeleteSection();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
