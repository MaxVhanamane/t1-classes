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
              "rounded-b-none data-[state=closed]:rounded-b-sm"
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
              "rounded-b-none data-[state=closed]:rounded-b-sm"
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
                <div className="space-y-1 px-4 pb-3 pt-1">
                  {topic.units.map((unit) => (
                    <UnitRow
                      key={unit.id}
                      unit={unit}
                      activeUnitId={activeUnitId}
                      onClick={() =>
                        unit.access === "accessible" &&
                        onUnitSelect(unit.id, unit.unitType)
                      }
                    />
                  ))}

                  {topic.practiceSets.map((ps) => (
                    <PracticeRow
                      key={ps.id}
                      practice={ps}
                      onClick={() =>
                        ps.access === "accessible" && onPracticeSelect(ps.id)
                      }
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

// Rows

function UnitRow({
  unit,
  onClick,
  activeUnitId,
}: {
  unit: CourseUnitOutline;
  onClick: () => void;
  activeUnitId?: string;
}) {
  const locked = unit.access === "locked";
  const Icon = unit.unitType === "video" ? PlayCircle : FileText;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={locked}
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer justify-start gap-2 px-2 py-2",
        "text-left text-sm font-normal",
        "hover:bg-muted/80",
        locked && "cursor-not-allowed text-muted-foreground",
        activeUnitId === unit.id && "ring ring-gray-300"
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

      {locked && <Lock className="h-3.5 w-3.5 opacity-60" />}
    </Button>
  );
}

function PracticeRow({
  practice,
  onClick,
}: {
  practice: PracticeSetOutline;
  onClick: () => void;
}) {
  const locked = practice.access === "locked";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={locked}
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer justify-start gap-2 px-2 py-2",
        "text-left text-sm font-normal",
        "hover:bg-muted/80",
        locked && "cursor-not-allowed text-muted-foreground"
      )}
    >
      <Brain className="h-4 w-4 shrink-0 opacity-70" />
      <span className="flex-1 truncate">{practice.title}</span>
      {locked && <Lock className="h-3.5 w-3.5 opacity-60" />}
    </Button>
  );
}
