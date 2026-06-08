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
// import { PdfViewerDialog } from "./pdf/pdf-viewer-dialog";
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
// import { PracticeSetDialog } from "./practice-set/practice-set-dialog";
import PlayerErrorState from "./player-error-state";
import { useQueryClient } from "@tanstack/react-query";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

import dynamic from "next/dynamic";

const PdfViewerDialog = dynamic(() =>
  import("./pdf/pdf-viewer-dialog").then((mod) => mod.PdfViewerDialog),
);

const PracticeSetDialog = dynamic(() =>
  import("./practice-set/practice-set-dialog").then(
    (mod) => mod.PracticeSetDialog,
  ),
);

/* ========================================================= */
/* Types                                                      */
/* ========================================================= */

export type UnitType = "pdf" | "video";

type CoursePlayerProps = {
  outline: CourseOutline;
  mode?: "learn" | "preview";
};

type PlayerState =
  | { status: "idle" }
  | { status: "initial-loading" }
  | { status: "loading"; unitId: string; unitType: UnitType }
  | { status: "ready"; unit: CourseUnitContent; iframeReady: boolean }
  | { status: "error"; message: string; unitId: string; unitType: UnitType }
  | {
      status: "pdf";
      unit: CourseUnitContent | null;
      isOpen: boolean;
      isLoading: boolean;
    }
  | { status: "practice"; unit: CourseUnitContent | null; isLoading: boolean };

/* ========================================================= */
/* Fetch helper                                               */
/* ========================================================= */
const fetchUnit = (unitId: string): Promise<CourseUnitContent> => {
  return fetchWrapper<CourseUnitContent>(
    `/api/learning/courses/units/${unitId}`,
  );
};

/* ========================================================= */
/* Component                                                  */
/* ========================================================= */

export function CoursePlayer({ outline, mode = "learn" }: CoursePlayerProps) {
  const queryClient = useQueryClient();

  const [playerState, setPlayerState] = useState<PlayerState>({
    status: "initial-loading",
  });
  const [activePracticeSetId, setActivePracticeSetId] = useState<string | null>(
    null,
  );
  const [activeUnitId, setActiveUnitId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openChapterIds, setOpenChapterIds] = useState<Set<string>>(new Set());
  const [openTopicIds, setOpenTopicIds] = useState<Set<string>>(new Set());

  const didHydrateRef = useRef(false);

  const [mobileMode, setMobileMode] = useState<"inline" | "drawer">(() => {
    if (typeof window === "undefined") return "inline";
    return localStorage.getItem("mobileCourseContentMode") === "drawer"
      ? "drawer"
      : "inline";
  });

  // Derived — no need for hasPreviewUnit state
  const previewUnit = outline.chapters
    .flatMap((c) => c.topics)
    .flatMap((t) => t.units)
    .find((u) => u.isFreePreview);

  /* -------------------------------------------------- */
  /* Persist mobile mode preference                      */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!didHydrateRef.current) return;
    localStorage.setItem("mobileCourseContentMode", mobileMode);
  }, [mobileMode]);

  // Reset transient UI state on route leave/unmount.
  // Next.js App Router may preserve cached client state, so close dialogs/drawers
  // here to prevent PDF/practice/mobile panels reopening when returning.
  useLayoutEffect(() => {
    return () => {
      setPlayerState((prev) =>
        prev.status === "pdf" ? { ...prev, isOpen: false } : prev,
      );
      setActivePracticeSetId(null);
      setMobileOpen(false);
    };
  }, []);
  /* -------------------------------------------------- */
  /* Load unit                                           */
  /* -------------------------------------------------- */

  const loadUnit = useCallback(
    async (
      unitId: string,
      unitType: UnitType,
      options?: { skipDialogOpen?: boolean },
    ) => {
      setActiveUnitId(unitId);

      // Immediate optimistic UI
      if (unitType === "pdf") {
        setPlayerState({
          status: "pdf",
          unit: null,
          isOpen: !options?.skipDialogOpen,
          isLoading: true,
        });
      } else {
        setPlayerState({ status: "loading", unitId, unitType });
      }

      if (mode === "learn") {
        localStorage.setItem(
          `course:${outline.courseId}:lastUnit`,
          JSON.stringify({ id: unitId, type: unitType }),
        );
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["course-unit", unitId],
          queryFn: () => fetchUnit(unitId),
          staleTime: unitType === "pdf" ? 1000 * 60 * 4 : Infinity,
        });

        if (unitType === "video") {
          setPlayerState({ status: "ready", unit: data, iframeReady: false });
        } else {
          setPlayerState({
            status: "pdf",
            unit: data,
            isOpen: !options?.skipDialogOpen,
            isLoading: false,
          });
        }
      } catch {
        setPlayerState({
          status: "error",
          message: "Something went wrong. Please try again.",
          unitId,
          unitType,
        });
      }
    },
    [mode, outline.courseId, queryClient],
  );

  /* -------------------------------------------------- */
  /* Restore last unit / preview unit on mount           */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (mode === "learn") {
      const saved = localStorage.getItem(`course:${outline.courseId}:lastUnit`);

      if (saved) {
        const { id, type } = JSON.parse(saved);
        void loadUnit(id, type, { skipDialogOpen: true });
      } else {
        const unitId = getFirstPlayableUnit(outline);
        if (unitId) {
          void loadUnit(unitId, "video");
        } else {
          setPlayerState({ status: "idle" });
        }
      }
    }

    if (mode === "preview") {
      if (previewUnit) {
        void loadUnit(previewUnit.id, previewUnit.unitType);
      } else {
        setPlayerState({ status: "idle" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outline, mode, loadUnit]);

  /* -------------------------------------------------- */
  /* Auto-expand active unit path in sidebar             */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (mode !== "learn" || !activeUnitId) return;

    const path = findUnitPath(outline, activeUnitId);
    if (!path) return;

    setOpenChapterIds((prev) => new Set(prev).add(path.chapterId));
    setOpenTopicIds((prev) => new Set(prev).add(path.topicId));
  }, [activeUnitId, outline, mode]);

  /* -------------------------------------------------- */
  /* Shared CourseStructureTree props                    */
  /* -------------------------------------------------- */

  const treeProps = {
    chapters: outline.chapters,
    activeUnitId,
    openChapterIds,
    openTopicIds,
    onToggleChapter: (id: string) =>
      setOpenChapterIds(
        (p) => new Set(p.has(id) ? [...p].filter((x) => x !== id) : [...p, id]),
      ),
    onToggleTopic: (id: string) =>
      setOpenTopicIds(
        (p) => new Set(p.has(id) ? [...p].filter((x) => x !== id) : [...p, id]),
      ),
    onUnitSelect: loadUnit,
    onPracticeSelect: (id: string) => setActivePracticeSetId(id),
  };

  /* -------------------------------------------------- */
  /* Derived dialog state helpers                        */
  /* -------------------------------------------------- */

  const isPdfOrPracticeDialog =
    playerState.status === "pdf" || playerState.status === "practice";

  const dialogTitle = isPdfOrPracticeDialog
    ? playerState.isLoading
      ? playerState.status === "pdf"
        ? "Fetching pdf..."
        : "Opening practice..."
      : playerState.status === "pdf"
        ? "PDF ready to view"
        : "Practice ready"
    : "";

  const dialogMessage = isPdfOrPracticeDialog
    ? playerState.isLoading
      ? ""
      : playerState.status === "pdf"
        ? "Click below to open this lesson."
        : "This lesson opens in an interactive practice view."
    : "";

  const dialogActionLabel =
    isPdfOrPracticeDialog && !playerState.isLoading
      ? playerState.status === "pdf"
        ? "Open PDF"
        : "Start Practice"
      : undefined;

  const handleDialogAction =
    isPdfOrPracticeDialog && !playerState.isLoading
      ? () => {
          if (playerState.status === "pdf") {
            setPlayerState((prev) =>
              prev.status === "pdf" ? { ...prev, isOpen: true } : prev,
            );
          } else {
            setActivePracticeSetId(playerState.unit?.id ?? null);
          }
        }
      : undefined;

  /* ================================================== */
  /* Render                                             */
  /* ================================================== */

  return (
    <div
      className={cn(
        "flex w-full flex-col lg:flex-row",
        mode === "learn" && "lg:px-7 lg:pr-119",
        mode === "preview" && "gap-6",
      )}
    >
      {/* ============================================= */}
      {/* LEFT — PLAYER                                 */}
      {/* ============================================= */}

      <div className="flex lg:flex-1 flex-col">
        <div
          className={cn(
            "bg-background",
            mode === "learn" && "lg:static lg:mt-3 sticky top-14 z-20",
            mode === "preview" && "relative",
          )}
        >
          {/* Skeletons */}
          {(playerState.status === "initial-loading" ||
            (playerState.status === "loading" &&
              playerState.unitType === "video")) && (
            <PlayerSkeleton
              label={
                playerState.status === "initial-loading"
                  ? "Preparing your content..."
                  : "Loading video..."
              }
            />
          )}

          {/* Video */}
          {playerState.status === "ready" &&
            playerState.unit.unitType === "video" && (
              <div className="relative">
                <VideoPlayer
                  unit={playerState.unit}
                  onIframeLoad={() =>
                    setPlayerState((prev) =>
                      prev.status === "ready"
                        ? { ...prev, iframeReady: true }
                        : prev,
                    )
                  }
                />
                {!playerState.iframeReady && (
                  <div className="absolute inset-0 z-10">
                    <PlayerSkeleton hideTitleSekeleton={true} />
                  </div>
                )}
              </div>
            )}

          {/* Error */}
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

          {/* PDF / Practice placeholder */}
          {isPdfOrPracticeDialog && (
            <EmptyPlayerState
              title={dialogTitle}
              message={dialogMessage}
              actionLabel={dialogActionLabel}
              onAction={handleDialogAction}
              variant={
                playerState.isLoading && playerState.status === "pdf"
                  ? "loading"
                  : "default"
              }
              loadingLabel={dialogTitle}
            />
          )}

          {/* Preview — no preview unit */}
          {playerState.status === "idle" &&
            mode === "preview" &&
            !previewUnit && (
              <EmptyPlayerState message="Preview content is not available for this course. Enroll to unlock full curriculum." />
            )}
        </div>

        {/* Mobile — toggle bar */}
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

        {/* Mobile — inline tree */}
        {mobileMode === "inline" && (
          <div className="lg:hidden mt-3">
            <div className="mx-1 border border-border rounded-sm">
              <CourseStructureTree {...treeProps} />
            </div>
          </div>
        )}

        {/* Mobile — drawer trigger */}
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

      {/* ============================================= */}
      {/* RIGHT — SIDEBAR                              */}
      {/* ============================================= */}

      <aside
        className={cn(
          "hidden lg:block",
          mode === "preview" && "w-full lg:w-95 shrink-0",
        )}
      >
        <div
          className={cn(
            "bg-background",
            mode === "learn" && "fixed top-14 right-7 w-md h-screen",
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
            <div className="flex-1 overflow-y-auto relative px-4 py-4">
              <div className="mx-auto border border-border rounded-sm">
                <CourseStructureTree {...treeProps} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================= */}
      {/* DRAWER (mobile)                              */}
      {/* ============================================= */}

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent className="h-[95vh] data-[vaul-drawer-direction=bottom]:max-h-[95vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>Course Content</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto mt-1.5">
            <div className="mx-1 border border-border rounded-sm">
              <CourseStructureTree
                {...treeProps}
                onUnitSelect={(id, type) => {
                  void loadUnit(id, type);
                  setMobileOpen(false);
                }}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ============================================= */}
      {/* DIALOGS                                      */}
      {/* ============================================= */}

      {playerState.status === "pdf" &&
        playerState.isOpen &&
        playerState.unit && (
          <PdfViewerDialog
            title={playerState.unit?.title ?? null}
            pdfUrl={playerState.unit?.contentUrl ?? null}
            loading={playerState.isLoading}
            onClose={() =>
              setPlayerState((prev) =>
                prev.status === "pdf" ? { ...prev, isOpen: false } : prev,
              )
            }
          />
        )}

      {activePracticeSetId && (
        <PracticeSetDialog
          practiceSetId={activePracticeSetId}
          onClose={() => {
            setActivePracticeSetId(null);
            setPlayerState((prev) =>
              prev.status === "pdf" ? { ...prev, isOpen: false } : prev,
            );
          }}
        />
      )}
    </div>
  );
}
