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
} from "../../zod-schema/schema";

import {
  BATCH_ACTIVE_FILTERS,
  BATCH_ADMISSION_FILTERS,
  BATCH_LIFECYCLE_FILTERS,
  DEFAULT_BATCH_FILTERS,
} from "../../constants/batch-filters.constants";

import type { BatchFilters } from "../../types/batch-filters";
import type {
  BatchMode,
  CourseSelectItem,
  InstructorSelectItem,
} from "../../types/types";
import { CourseFilterCombobox } from "./course-filter-combobox";
import { InstructorFilterCombobox } from "./instructor-filter-combobox";

type Props = {
  filters: BatchFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: BatchFilters) => void;
  courses: CourseSelectItem[];

  instructors: InstructorSelectItem[];
  isCoursesLoading: boolean;

  isInstructorsLoading: boolean;
};

const MODE_LABELS: Record<BatchMode, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export function BatchFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  courses,
  instructors,
  isCoursesLoading,
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

    onFiltersChange(DEFAULT_BATCH_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search batches..."
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
              active: value as BatchFilters["active"],
              page: 1,
            })
          }
        >
          <SelectTrigger className="min-w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {BATCH_ACTIVE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Batches"
                  : value === "active"
                    ? "Active"
                    : "Inactive"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lifecycle */}
        <Select
          value={filters.lifecycle ?? undefined}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              lifecycle:
                value === "__all__"
                  ? null
                  : (value as BatchFilters["lifecycle"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Lifecycle" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Lifecycles</SelectItem>

            {BATCH_LIFECYCLE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Admissions */}
        <Select
          value={filters.admission ?? undefined}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              admission:
                value === "__all__"
                  ? null
                  : (value as BatchFilters["admission"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Admissions" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Admissions</SelectItem>

            {BATCH_ADMISSION_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "open" ? "Open" : "Closed"}
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
                  : (value as BatchFilters["category"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
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
                  value === "__all__" ? null : (value as BatchFilters["board"]),
                page: 1,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Board" />
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

        {/* Mode */}
        <Select
          value={filters.mode ?? undefined}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              mode: value === "__all__" ? null : (value as BatchMode),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Mode" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Modes</SelectItem>

            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <SelectValue placeholder="Class" />
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
                  : (value as BatchFilters["targetExam"]),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Target Exam" />
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

        <CourseFilterCombobox
          isLoading={isCoursesLoading}
          value={filters.courseId}
          courses={courses}
          onChange={(courseId) =>
            onFiltersChange({
              ...filters,
              courseId,
              page: 1,
            })
          }
        />

        <InstructorFilterCombobox
          isLoading={isInstructorsLoading}
          value={filters.instructorId}
          instructors={instructors}
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
