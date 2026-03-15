"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  PlayCircle,
  FileText,
  Brain,
  Lock,
  ChevronDown,
  Eye,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

import {
  CourseChapter,
  CourseTopic,
  CourseUnitOutline,
  PracticeSetOutline,
} from "@/src/types/course-outline.types";

import { UnitType } from "./course-player";
import { useEffect, useRef, useState } from "react";
import { GrafanaBackground } from "../../../../../../../components/ui/grafana-background";

type Props = {
  chapters: CourseChapter[];
  activeUnitId?: string;

  openChapterIds: Set<string>;
  openTopicIds: Set<string>;

  onToggleChapter: (id: string) => void;
  onToggleTopic: (id: string) => void;

  onUnitSelect: (unitId: string, unitType: UnitType) => void;
  onPracticeSelect: (practiceSetId: string) => void;
};

export function CourseStructureTree({
  chapters,
  activeUnitId,
  openChapterIds,
  openTopicIds,
  onToggleChapter,
  onToggleTopic,
  onUnitSelect,
  onPracticeSelect,
}: Props) {
  return (
    <div className="space-y-4 p-3 lg:p-4">
      {chapters.map((chapter) => (
        <ChapterBlock
          key={chapter.id}
          chapter={chapter}
          open={openChapterIds.has(chapter.id)}
          onToggle={() => onToggleChapter(chapter.id)}
          openTopicIds={openTopicIds}
          onToggleTopic={onToggleTopic}
          activeUnitId={activeUnitId}
          onUnitSelect={onUnitSelect}
          onPracticeSelect={onPracticeSelect}
        />
      ))}
    </div>
  );
}

// Chapter

function ChapterBlock({
  chapter,
  open,
  onToggle,
  openTopicIds,
  onToggleTopic,
  activeUnitId,
  onUnitSelect,
  onPracticeSelect,
}: {
  chapter: CourseChapter;
  open: boolean;
  onToggle: () => void;

  openTopicIds: Set<string>;
  onToggleTopic: (id: string) => void;

  activeUnitId?: string;
  onUnitSelect: (unitId: string, unitType: UnitType) => void;
  onPracticeSelect: (id: string) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <div className="border rounded-sm overflow-hidden bg-muted/30">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "group w-full justify-between px-4 py-6",
              "text-left text-sm font-semibold text-foreground",
              "cursor-pointer",
              "rounded-b-none data-[state=closed]:rounded-b-sm",
            )}
          >
            <span className="line-clamp-2 leading-snug">{chapter.title}</span>

            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent forceMount asChild>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="chapter-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-b-sm"
              >
                <Separator />

                <div className="space-y-3 p-3">
                  {chapter.topics.map((topic) => (
                    <TopicBlock
                      key={topic.id}
                      topic={topic}
                      open={openTopicIds.has(topic.id)}
                      onToggle={() => onToggleTopic(topic.id)}
                      activeUnitId={activeUnitId}
                      onUnitSelect={onUnitSelect}
                      onPracticeSelect={onPracticeSelect}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Topic

function TopicBlock({
  topic,
  open,
  onToggle,
  activeUnitId,
  onUnitSelect,
  onPracticeSelect,
}: {
  topic: CourseTopic;
  open: boolean;
  onToggle: () => void;

  activeUnitId?: string;
  onUnitSelect: (unitId: string, unitType: UnitType) => void;
  onPracticeSelect: (id: string) => void;
}) {
  const lessonCount = topic.units.length;
  const practiceCount = topic.practiceSets.length;
  const [lockedFeedbackFor, setLockedFeedbackFor] = useState<string | null>(
    null,
  );
  const [feedbackPos, setFeedbackPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [drawLock, setDrawLock] = useState(false);
  const unlockRef = useRef<HTMLDivElement | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!lockedFeedbackFor) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setLockedFeedbackFor(null);
      setFeedbackPos(null);
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lockedFeedbackFor]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!unlockRef.current) return;

      if (!unlockRef.current.contains(e.target as Node)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setLockedFeedbackFor(null);
        setFeedbackPos(null);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const meta =
    practiceCount > 0
      ? `${lessonCount} lessons • ${practiceCount} practice`
      : `${lessonCount} lessons`;

  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <div className="border rounded-sm overflow-hidden bg-background">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "group w-full h-fit flex justify-between",
              "px-4 py-3 text-left cursor-pointer",
              "hover:bg-muted/80",
              "rounded-b-none data-[state=closed]:rounded-b-sm",
            )}
          >
            <div className="flex min-w-0 flex-col">
              <div className="line-clamp-2 text-sm font-medium leading-snug">
                {topic.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
            </div>

            <ChevronDown className="ml-3 mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent forceMount asChild>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="topic-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="space-y-1 px-4 pb-3 pt-1 relative ">
                  {topic.units.map((unit) => (
                    <UnitRow
                      key={unit.id}
                      unit={unit}
                      activeUnitId={activeUnitId}
                      onClick={(e) => {
                        if (unit.access === "accessible") {
                          onUnitSelect(unit.id, unit.unitType);
                        } else {
                          const rect = (
                            e.currentTarget as HTMLElement
                          ).getBoundingClientRect();

                          setLockedFeedbackFor(unit.id);
                          setFeedbackPos({
                            top: rect.bottom,
                            left: rect.left + rect.width / 2,
                          });
                        }
                      }}
                    />
                  ))}

                  {topic.practiceSets.map((ps) => (
                    <PracticeRow
                      key={ps.id}
                      practice={ps}
                      onClick={(e) => {
                        if (ps.access === "accessible") {
                          onPracticeSelect(ps.id);
                        } else {
                          const rect = (
                            e.currentTarget as HTMLElement
                          ).getBoundingClientRect();

                          setLockedFeedbackFor(ps.id);
                          setFeedbackPos({
                            top: rect.bottom,
                            left: rect.left + rect.width / 2,
                          });
                        }
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {lockedFeedbackFor && feedbackPos && (
                    <motion.div
                      key={lockedFeedbackFor}
                      ref={unlockRef}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        type: "tween",
                        ease: "easeInOut",
                        duration: 0.15,
                      }}
                      onAnimationComplete={() => {
                        setDrawLock(true);
                      }}
                      style={{
                        position: "fixed",
                        top: feedbackPos.top + 14,
                        left: feedbackPos.left,
                      }}
                      className="
        z-999
        w-[320px]
        rounded-xl
        border border-primary/30
        bg-background
        backdrop-blur-md
        shadow-[0_10px_30px_rgba(0,0,0,0.12)]
        p-4 -translate-x-1/2 relative 
      "
                    >
                      <GrafanaBackground opacity={1} />
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-lg bg-muted/60">
                          <motion.svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-foreground/80"
                          >
                            {/* Body */}
                            <motion.rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              ry="2"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: drawLock ? 1 : 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                            />

                            {/* Shackle */}
                            <motion.path
                              d="M7 11V7a5 5 0 0 1 10 0v4"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: drawLock ? 1 : 0 }}
                              transition={{
                                duration: 0.4,
                                ease: "easeInOut",
                                delay: 0.15,
                              }}
                            />
                          </motion.svg>
                        </div>

                        {/* Text */}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold tracking-tight">
                            This content is locked
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Enroll in this course to unlock all lessons and
                            practice sets.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Rows

function UnitRow({
  unit,
  onClick,
  activeUnitId,
}: {
  unit: CourseUnitOutline;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  activeUnitId?: string;
}) {
  const locked = unit.access === "locked";
  const Icon = unit.unitType === "video" ? PlayCircle : FileText;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer justify-start gap-2 px-2 py-2",
        "text-left text-sm font-normal",
        "hover:bg-muted/80",
        locked && " text-foreground/70 disabled:opacity-100",
        activeUnitId === unit.id && "bg-muted",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      <span className="flex-1 truncate">{unit.title}</span>

      {unit.isFreePreview && !locked && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          Preview
        </span>
      )}

      {locked && <Lock className="h-3.5 w-3.5 opacity-70" />}
    </Button>
  );
}

function PracticeRow({
  practice,
  onClick,
}: {
  practice: PracticeSetOutline;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const locked = practice.access === "locked";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer justify-start gap-2 px-2 py-2",
        "text-left text-sm font-normal",
        "hover:bg-muted/80",
        locked && "text-foreground/70 disabled:opacity-100",
      )}
    >
      <Brain className="h-4 w-4 shrink-0 opacity-70" />
      <span className="flex-1 truncate">{practice.title}</span>
      {locked && <Lock className="h-3.5 w-3.5 opacity-70" />}
    </Button>
  );
}
