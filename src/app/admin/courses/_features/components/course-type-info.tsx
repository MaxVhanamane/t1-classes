"use client";

import { Info, GraduationCap, Layers, Target, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { JSX } from "react";

export function CourseTypeInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-2 hover:bg-muted"
        >
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className="
          w-95 sm:w-110
          p-0 overflow-hidden
          rounded-2xl
          border
          bg-background/95
          backdrop-blur
          shadow-2xl
        "
      >
        <div>
          <Content />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------- Content ---------------- */

function Content() {
  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-base text-foreground">
          Course Type Guide
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select the type that best describes the primary purpose and structure
          of your course.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-3">
        <TypeCard
          icon={GraduationCap}
          title="Academic"
          description="Courses aligned with school curriculum and board syllabus. Typically structured for regular learning alongside school education."
        />

        <TypeCard
          icon={Layers}
          title="Foundation"
          description="Courses focused on building strong conceptual understanding and strengthening subject fundamentals for long-term learning."
        />

        <TypeCard
          icon={Target}
          title="Exam"
          description="Courses specifically designed for preparation of competitive or entrance examinations such as NEET, JEE, MPSC, and similar tests."
        />

        <TypeCard
          icon={Zap}
          title="Crash"
          description="Short-term, intensive programs aimed at quick revision or rapid preparation. Ideal for covering key topics in a limited time."
        />
      </div>
    </div>
  );
}

/* ---------------- Card ---------------- */

function TypeCard({
  icon: Icon,
  title,
  description,
}: {
  icon: JSX.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex gap-3
        rounded-xl border
        p-3
        bg-muted/40
      "
    >
      {/* Icon */}
      <div className="mt-0.5">
        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-background border shadow-sm">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Text */}
      <div>
        <p className="font-medium text-sm leading-none">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
