"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CourseOutline } from "@/src/types/course-outline.types";
import { CourseStructureTree } from "./course-structure-tree";
import { PlayerSkeleton } from "./player-skeleton";
import { VideoPlayer } from "./video-player";
import { PdfViewerDialog } from "./pdf/pdf-viewer-dialog";
import EmptyPlayerState from "./empty-player-state";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/src/components/ui/drawer";
import { cn } from "@/src/lib/utils";
import type { CourseUnitContent } from "../types/course-unit-content";
import {
  findUnitPath,
  getFirstPlayableUnit,
} from "../helper-functions/course-progress";
import { PracticeSetDialog } from "./practice-set/practice-set-dialog";

export type UnitType = "pdf" | "video";

type CoursePlayerProps = {
  outline: CourseOutline;
  mode?: "learn" | "preview";
};

export function CoursePlayer({ outline, mode = "learn" }: CoursePlayerProps) {
  const [unitContent, setUnitContent] = useState<CourseUnitContent | null>(
    null,
  );

  const [activePracticeSetId, setActivePracticeSetId] = useState<string | null>(
    null,
  );
  const [hasPreviewUnit, setHasPreviewUnit] = useState(true);

  const [activeUnitId, setActiveUnitId] = useState("");
  const [unitType, setUnitType] = useState<UnitType | null>(null);

  const [loading, setLoading] = useState<
    UnitType | "pdf-dialog-closed" | "initial" | null
  >("initial");

  const didHydrateRef = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState<"inline" | "drawer">("inline");

  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(new Set());

  const [openTopicIds, setOpenTopicIds] = useState<Set<string>>(new Set());

  const abortRef = useRef<AbortController | null>(null);

  /* -------------------------------------------------- */
  /* Hydration                                           */
  /* -------------------------------------------------- */

  useLayoutEffect(() => {
    const saved = localStorage.getItem("mobileCourseContentMode");
    if (saved === "inline" || saved === "drawer") {
      setMobileMode(saved);
    }
    didHydrateRef.current = true;
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    localStorage.setItem("mobileCourseContentMode", mobileMode);
  }, [mobileMode]);

  /* -------------------------------------------------- */
  /* Load unit                                           */
  /* -------------------------------------------------- */

  const loadUnit = useCallback(
    async (unitId: string, unitType: UnitType) => {
      // Abort previous request
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(unitType);
      setActiveUnitId(unitId);
      setUnitType(unitType);

      // Save progress only in learn mode
      if (mode === "learn") {
        localStorage.setItem("lastCourseUnitId", unitId);
      }

      try {
        const res = await fetch(`/api/courses/units/${unitId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          setUnitContent(null);
          return;
        }

        const data: CourseUnitContent = await res.json();

        if (!controller.signal.aborted) {
          setUnitContent(data);
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setUnitContent(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(null);
        }
      }
    },
    [mode], //  dependency
  );
  /* -------------------------------------------------- */
  /* Restore last unit                                   */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (mode === "learn") {
      const savedUnitId = localStorage.getItem("lastCourseUnitId");
      const unitId = savedUnitId ?? getFirstPlayableUnit(outline);

      if (unitId) {
        void loadUnit(unitId, "video");
      } else {
        setLoading(null);
      }
    }

    if (mode === "preview") {
      const previewUnit = outline.chapters
        .flatMap((c) => c.topics)
        .flatMap((t) => t.units)
        .find((u) => u.isFreePreview);

      if (previewUnit) {
        setHasPreviewUnit(true);
        void loadUnit(previewUnit.id, previewUnit.unitType);
      } else {
        setHasPreviewUnit(false);
        setLoading(null); // stop skeleton
      }
    }
  }, [outline, mode, loadUnit]);

  /* -------------------------------------------------- */
  /* Auto-open path                                      */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (mode !== "learn") return; // Disable for preview

    if (!activeUnitId) return;

    const path = findUnitPath(outline, activeUnitId);
    if (!path) return;

    setOpenChapterIds((prev) => new Set(prev).add(path.chapterId));
    setOpenTopicIds((prev) => new Set(prev).add(path.topicId));
  }, [activeUnitId, outline, mode]);

  /* ================================================== */
  /* Layout                                             */
  /* ================================================== */
  console.log("loading", loading);
  console.log("unitType", unitType);
  return (
    <div
      className={cn(
        "flex w-full flex-col lg:flex-row",
        mode === "learn" && "lg:px-7 lg:pr-119", // unchanged
        mode === "preview" && "gap-6",
      )}
    >
      {/* ================================================= */}
      {/* LEFT — PLAYER                                    */}
      {/* ================================================= */}

      <div className="flex lg:flex-1 flex-col">
        <div
          className={cn(
            "bg-background",
            mode === "learn" && "lg:static lg:mt-3 sticky top-14 z-20",
            mode === "preview" && "relative",
          )}
        >
          {loading && unitType === "video" && <PlayerSkeleton />}
          {loading === "initial" && hasPreviewUnit && <PlayerSkeleton />}

          {!loading && unitContent?.unitType === "video" && (
            <VideoPlayer unit={unitContent} />
          )}
          {/* No preview fallback */}
          {!loading && mode === "preview" && !hasPreviewUnit && (
            <EmptyPlayerState message="Preview content is not available for this course. Enroll to unlock full curriculum." />
          )}

          {loading === "pdf-dialog-closed" && (
            <EmptyPlayerState message="This item opens in a separate viewer. Select another unit to continue, or select this one again to reopen it." />
          )}
        </div>

        {/* Mobile toggle — unchanged */}
        <div className="lg:hidden px-4 flex justify-between items-center border-t border-b py-2">
          <span className="text-sm text-muted-foreground">Course content</span>

          <div className="flex rounded-lg border p-1 text-xs">
            <button
              onClick={() => setMobileMode("inline")}
              className={cn(
                "px-2 py-1 rounded",
                mobileMode === "inline" && "bg-muted font-semibold",
              )}
            >
              Inline
            </button>

            <button
              onClick={() => setMobileMode("drawer")}
              className={cn(
                "px-2 py-1 rounded",
                mobileMode === "drawer" && "bg-muted font-semibold",
              )}
            >
              Drawer
            </button>
          </div>
        </div>

        {mobileMode === "inline" && (
          <div className="lg:hidden mt-3">
            <CourseStructureTree
              chapters={outline.chapters}
              activeUnitId={activeUnitId}
              openChapterIds={openChapterIds}
              openTopicIds={openTopicIds}
              onToggleChapter={(id) =>
                setOpenChapterIds(
                  (p) =>
                    new Set(
                      p.has(id) ? [...p].filter((x) => x !== id) : [...p, id],
                    ),
                )
              }
              onToggleTopic={(id) =>
                setOpenTopicIds(
                  (p) =>
                    new Set(
                      p.has(id) ? [...p].filter((x) => x !== id) : [...p, id],
                    ),
                )
              }
              onUnitSelect={loadUnit}
              onPracticeSelect={(id) => setActivePracticeSetId(id)}
            />
          </div>
        )}

        {mobileMode === "drawer" && (
          <div className="lg:hidden px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-full rounded-lg border py-3 text-sm font-semibold"
            >
              Open course content
            </button>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* RIGHT — SIDEBAR                                  */}
      {/* ================================================= */}

      <aside
        className={cn(
          "hidden lg:block",
          mode === "preview" && "w-full lg:w-95 shrink-0",
        )}
      >
        <div
          className={cn(
            "bg-background",
            mode === "learn" &&
              "fixed top-14 right-7 mr-(--removed-body-scroll-bar-size) w-md h-screen",
            mode === "preview" &&
              "relative border rounded-xl h-150 overflow-hidden",
          )}
        >
          <div
            className={cn(
              "flex flex-col",
              mode === "learn" && "h-[calc(100vh-56px)]",
              mode === "preview" && "h-full",
            )}
          >
            <h1 className="px-4 py-3 text-lg font-semibold shrink-0">
              Course Content
            </h1>

            <div className="flex-1 overflow-y-auto scrollbar-gutter-stable">
              <CourseStructureTree
                chapters={outline.chapters}
                activeUnitId={activeUnitId}
                openChapterIds={openChapterIds}
                openTopicIds={openTopicIds}
                onToggleChapter={(id) =>
                  setOpenChapterIds(
                    (p) =>
                      new Set(
                        p.has(id) ? [...p].filter((x) => x !== id) : [...p, id],
                      ),
                  )
                }
                onToggleTopic={(id) =>
                  setOpenTopicIds(
                    (p) =>
                      new Set(
                        p.has(id) ? [...p].filter((x) => x !== id) : [...p, id],
                      ),
                  )
                }
                onUnitSelect={loadUnit}
                onPracticeSelect={(id) => setActivePracticeSetId(id)}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================= */}
      {/* DRAWER — unchanged                               */}
      {/* ================================================= */}

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>Course Content</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            <CourseStructureTree
              chapters={outline.chapters}
              activeUnitId={activeUnitId}
              openChapterIds={openChapterIds}
              openTopicIds={openTopicIds}
              onToggleChapter={(id) =>
                setOpenChapterIds(
                  (p) =>
                    new Set(
                      p.has(id) ? [...p].filter((x) => x !== id) : [...p, id],
                    ),
                )
              }
              onToggleTopic={(id) =>
                setOpenTopicIds(
                  (p) =>
                    new Set(
                      p.has(id) ? [...p].filter((x) => x !== id) : [...p, id],
                    ),
                )
              }
              onUnitSelect={(id, type) => {
                void loadUnit(id, type);
                setMobileOpen(false);
              }}
              onPracticeSelect={(id) => setActivePracticeSetId(id)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Dialogs — unchanged */}

      {unitType === "pdf" && (
        <PdfViewerDialog
          unit={unitContent}
          loading={loading === "pdf"}
          onClose={() => {
            setUnitContent(null);
            setUnitType(null);
            setLoading("pdf-dialog-closed");
          }}
        />
      )}

      {activePracticeSetId && (
        <PracticeSetDialog
          practiceSetId={activePracticeSetId}
          onClose={() => setActivePracticeSetId(null)}
        />
      )}
    </div>
  );
}
