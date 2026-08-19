"use client";

import { RotateCcw, Search } from "lucide-react";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { HomeworkChapterFilters } from "../types/homework";
import {
  SUBJECTS,
  SUBJECT_LABELS,
  TARGET_EXAMS,
  TARGET_EXAM_LABELS,
  Subject,
  TargetExam,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

type HomeworkChapterFiltersBarProps = {
  filters: HomeworkChapterFilters;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (filters: HomeworkChapterFilters) => void;
};

export function HomeworkChapterFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
}: HomeworkChapterFiltersBarProps) {
  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      search: searchInput.trim(),
      page: 1,
    });
  };

  const handleReset = () => {
    onSearchInputChange("");
    onFiltersChange({
      ...filters,
      search: "",
      classLevel: null,
      targetExam: null,
      subject: null,
      page: 1,
    });
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search chapters by name..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="mr-2 size-4" />
          Search
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-3">
        <Select
          value={filters.classLevel?.toString() ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              classLevel: value === "__all__" ? null : Number(value),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Classes</SelectItem>
            {[6, 7, 8, 9, 10, 11, 12].map((level) => (
              <SelectItem key={level} value={String(level)}>
                Class {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.subject ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              subject: value === "__all__" ? null : (value as Subject),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Subjects</SelectItem>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {SUBJECT_LABELS[subject]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.targetExam ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              targetExam: value === "__all__" ? null : (value as TargetExam),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Exams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Exams</SelectItem>
            {TARGET_EXAMS.map((exam) => (
              <SelectItem key={exam} value={exam}>
                {TARGET_EXAM_LABELS[exam]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
