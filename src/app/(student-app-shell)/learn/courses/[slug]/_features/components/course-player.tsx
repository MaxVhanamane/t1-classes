"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
import PlayerErrorState from "./player-error-state";

export type UnitType = "pdf" | "video";

type CoursePlayerProps = {
  outline: CourseOutline;
  mode?: "learn" | "preview";
};

/* ========================================================= */
/* Player State Machine                                      */
/* ========================================================= */

type PlayerState =
  | { status: "idle" }
  | { status: "initial-loading" }
  | { status: "loading"; unitId: string; unitType: UnitType }
  | { status: "ready"; unit: CourseUnitContent }
  | { status: "error"; message: string; unitId: string; unitType: UnitType }
  | { status: "pdf-dialog-closed" };

export function CoursePlayer({ outline, mode = "learn" }: CoursePlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    status: "initial-loading",
  });

  const [activePracticeSetId, setActivePracticeSetId] = useState<string | null>(
    null,
  );

  const [hasPreviewUnit, setHasPreviewUnit] = useState(true);
  const [activeUnitId, setActiveUnitId] = useState("");

  const didHydrateRef = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState<"inline" | "drawer">(() => {
    if (typeof window === "undefined") return "inline";

    const saved = localStorage.getItem("mobileCourseContentMode");
    return saved === "drawer" ? "drawer" : "inline";
  });

  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(new Set());
  const [openTopicIds, setOpenTopicIds] = useState<Set<string>>(new Set());

  const abortRef = useRef<AbortController | null>(null);

  /* -------------------------------------------------- */
  /* Hydration                                           */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!didHydrateRef.current) return;
    localStorage.setItem("mobileCourseContentMode", mobileMode);
  }, [mobileMode]);

  /* -------------------------------------------------- */
  /* Load unit                                           */
  /* -------------------------------------------------- */

  const loadUnit = useCallback(
    async (unitId: string, unitType: UnitType) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setActiveUnitId(unitId);

      setPlayerState({
        status: "loading",
        unitId,
        unitType,
      });

      if (mode === "learn") {
        localStorage.setItem("lastCourseUnitId", unitId);
      }

      try {
        const res = await fetch(`/api/learning/courses/units/${unitId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          setPlayerState({
            status: "error",
            message: "Something went wrong on our side. Please try again.",
            unitId,
            unitType,
          });

          return;
        }

        const data: CourseUnitContent = await res.json();

        if (!controller.signal.aborted) {
          setPlayerState({
            status: "ready",
            unit: data,
          });
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setPlayerState({
            status: "error",
            message: "Something went wrong. Please try again.",
            unitId,
            unitType,
          });
        }
      }
    },
    [mode],
  );

  /* -------------------------------------------------- */
  /* Restore last unit                                   */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (mode === "learn") {
      const savedUnitId = localStorage.getItem("lastCourseUnitId");
      const unitId = savedUnitId ?? getFirstPlayableUnit(outline);

      if (unitId) {
        /* eslint-disable react-hooks/set-state-in-effect */
        void loadUnit(unitId, "video");
      } else {
        setPlayerState({ status: "idle" });
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
        setPlayerState({ status: "idle" });
      }
    }
  }, [outline, mode, loadUnit]);

  /* -------------------------------------------------- */
  /* Auto-open path                                      */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (mode !== "learn") return;
    if (!activeUnitId) return;

    const path = findUnitPath(outline, activeUnitId);
    if (!path) return;

    setOpenChapterIds((prev) => new Set(prev).add(path.chapterId));
    setOpenTopicIds((prev) => new Set(prev).add(path.topicId));
  }, [activeUnitId, outline, mode]);

  /* ================================================== */
  /* Layout                                             */
  /* ================================================== */

  return (
    <div
      className={cn(
        "flex w-full flex-col lg:flex-row",
        mode === "learn" && "lg:px-7 lg:pr-119",
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
          {playerState.status === "initial-loading" && hasPreviewUnit && (
            <PlayerSkeleton />
          )}

          {playerState.status === "loading" &&
            playerState.unitType === "video" && <PlayerSkeleton />}

          {playerState.status === "ready" &&
            playerState.unit.unitType === "video" && (
              <VideoPlayer unit={playerState.unit} />
            )}

          {playerState.status === "error" && (
            <PlayerErrorState
              message={playerState.message}
              onRetry={() => {
                if (playerState.status === "error") {
                  void loadUnit(playerState.unitId, playerState.unitType);
                }
              }}
            />
          )}

          {playerState.status === "pdf-dialog-closed" && (
            <EmptyPlayerState message="This item opens in a separate viewer. Select another unit to continue, or select this one again to reopen it." />
          )}

          {!(
            playerState.status === "loading" ||
            playerState.status === "ready" ||
            playerState.status === "error"
          ) &&
            mode === "preview" &&
            !hasPreviewUnit && (
              <EmptyPlayerState message="Preview content is not available for this course. Enroll to unlock full curriculum." />
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

      {/* RIGHT SIDEBAR unchanged */}
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

      {/* Drawer unchanged */}
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

      {/* PDF Dialog */}
      {playerState.status === "ready" &&
        playerState.unit.unitType === "pdf" && (
          <PdfViewerDialog
            unit={playerState.unit}
            loading={false}
            onClose={() => setPlayerState({ status: "pdf-dialog-closed" })}
          />
        )}

      {/* Practice Dialog unchanged */}
      {activePracticeSetId && (
        <PracticeSetDialog
          practiceSetId={activePracticeSetId}
          onClose={() => setActivePracticeSetId(null)}
        />
      )}
    </div>
  );
}
