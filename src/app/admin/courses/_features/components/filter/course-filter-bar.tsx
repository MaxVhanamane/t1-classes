"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import {
  BOARD_LABELS,
  CATEGORY_LABELS,
  TARGET_EXAM_LABELS,
  BOARDS,
  CATEGORIES,
  TARGET_EXAMS,
} from "@/src/app/admin/batches/_features/zod-schema/schema";
import type { InstructorOption } from "../../types/course.types";
import type { CourseFilters } from "../../types/course-filters";
import {
  COURSE_ACTIVE_FILTERS,
  DEFAULT_COURSE_FILTERS,
} from "../../constants/course-filters.constants";
import { InstructorFilterCombobox } from "@/src/app/admin/batches/_features/components/filter/instructor-filter-combobox";

type Props = {
  filters: CourseFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: CourseFilters) => void;

  instructors: InstructorOption[];

  isInstructorsLoading: boolean;
};

export function CourseFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  instructors,
  isInstructorsLoading,
}: Props) {
  function handleSearch() {
    onFiltersChange({
      ...filters,

      search: searchInput.trim(),

      page: 1,
    });
  }

  function handleReset() {
    onSearchInputChange("");

    onFiltersChange(DEFAULT_COURSE_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search courses..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="pl-9"
          />
        </div>

        <Button onClick={handleSearch}>
          <Search className="mr-2 size-4" />
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* Active */}
        <Select
          value={filters.active}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              active: value as CourseFilters["active"],

              page: 1,
            })
          }
        >
          <SelectTrigger className="min-w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {COURSE_ACTIVE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Courses"
                  : value === "active"
                    ? "Active"
                    : "Inactive"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={filters.category ?? undefined}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              category:
                value === "__all__"
                  ? null
                  : (value as CourseFilters["category"]),

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>

            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Board */}
        {filters.category === "boards" && (
          <Select
            value={filters.board ?? undefined}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,

                board:
                  value === "__all__"
                    ? null
                    : (value as CourseFilters["board"]),

                page: 1,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Board" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="__all__">All Boards</SelectItem>

              {BOARDS.map((board) => (
                <SelectItem key={board} value={board}>
                  {BOARD_LABELS[board]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Class */}
        <Select
          value={filters.classLevel?.toString() ?? undefined}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              classLevel: value === "__all__" ? null : Number(value),

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Class" />
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

        {/* Target Exam */}
        <Select
          value={filters.targetExam ?? undefined}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              targetExam:
                value === "__all__"
                  ? null
                  : (value as CourseFilters["targetExam"]),

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Target Exam" />
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

        <InstructorFilterCombobox
          value={filters.instructorId}
          instructors={instructors}
          isLoading={isInstructorsLoading}
          onChange={(instructorId) =>
            onFiltersChange({
              ...filters,

              instructorId,

              page: 1,
            })
          }
        />

        {/* Reset */}
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
