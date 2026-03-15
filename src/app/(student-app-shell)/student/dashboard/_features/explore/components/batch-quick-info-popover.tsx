"use client";

import { useState } from "react";
import { Info, GraduationCap, BookOpen, Layers, Library } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { GrafanaBackground } from "@/src/components/ui/grafana-background";

/* -------------------------------------------------------------------------- */

interface Props {
  classLevel?: number | null;
  targetExam?: string | null;
  subjects?: string[] | null;
  courseCount?: number | null;
}

/* -------------------------------------------------------------------------- */

export function BatchQuickInfoPopover({
  classLevel,
  targetExam,
  subjects = [],
  courseCount,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* ================= TRIGGER ================= */}
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="
            h-7 gap-1.5 px-2 text-xs
            text-muted-foreground
            hover:text-foreground
          "
        >
          <Info size={14} />
          Quick Info
        </Button>
      </PopoverTrigger>

      {/* ================= CONTENT ================= */}
      <PopoverContent
        align="end"
        className="
          w-80
          rounded-2xl
          border
          bg-card
          p-4
          shadow-2xl
          space-y-5
          relative
        "
      >
        <GrafanaBackground opacity={0.3} />
        {/* ---------- Header ---------- */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Batch Overview
            </p>
            <p className="text-xs text-muted-foreground">
              Key details about this batch
            </p>
          </div>
        </div>

        {/* ---------- Divider ---------- */}
        <div className="border-t" />

        {/* ---------- Info Rows ---------- */}
        <div className="space-y-4">
          {courseCount !== null && courseCount !== undefined && (
            <InfoRow icon={<Library size={16} />} label="Courses Included">
              <p className="text-sm font-semibold text-foreground">
                {courseCount} {courseCount === 1 ? "Course" : "Courses"}
              </p>
            </InfoRow>
          )}
          {classLevel && (
            <InfoRow icon={<GraduationCap size={16} />} label="Class Level">
              <Badge variant="outline">Class {classLevel}</Badge>
            </InfoRow>
          )}

          {targetExam && (
            <InfoRow icon={<BookOpen size={16} />} label="Target Exam">
              <p className="text-sm text-foreground leading-snug">
                {targetExam}
              </p>
            </InfoRow>
          )}

          {subjects && subjects.length > 0 && (
            <InfoRow icon={<Layers size={16} />} label="Subjects Covered">
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((sub) => (
                  <Badge key={sub} variant="secondary" className="text-xs">
                    {sub}
                  </Badge>
                ))}
              </div>
            </InfoRow>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Reusable Info Row                                */
/* -------------------------------------------------------------------------- */

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>

      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}
