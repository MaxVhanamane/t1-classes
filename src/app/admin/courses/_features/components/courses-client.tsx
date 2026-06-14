"use client";

import { useState } from "react";

import { Pagination } from "@/src/components/ui/pagination/pagination";
import { CardSkeleton } from "@/src/components/ui/skeleton/table/table-cards-skeleton";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";

import { CourseDialog } from "./course-dialog";
import { CoursesTable } from "./courses-table";
import { CoursesHeader } from "./courses-header";

import { BatchTestsErrorState } from "@/src/app/student/learn/batches/[batchId]/_features/components/tests/batch-tests-error-state";

import { DEFAULT_COURSE_FILTERS } from "../constants/course-filters.constants";

import { useCourses } from "../hooks/use-courses";

import type { CourseRow } from "../types/course.types";

import { useInstructorOptions } from "@/src/hooks/use-instructor-options";
import { CourseFiltersBar } from "./filter/course-filter-bar";
import { CoursesEmptyState } from "./courses-empty-state";

export function CoursesClient() {
  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState<CourseRow | null>(null);

  const [filters, setFilters] = useState(DEFAULT_COURSE_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error, refetch } = useCourses(filters);

  const { data: instructors = [], isLoading: isInstructorsLoading } =
    useInstructorOptions();

  const hasActiveFilters =
    filters.search !== DEFAULT_COURSE_FILTERS.search ||
    filters.active !== DEFAULT_COURSE_FILTERS.active ||
    filters.category !== DEFAULT_COURSE_FILTERS.category ||
    filters.board !== DEFAULT_COURSE_FILTERS.board ||
    filters.classLevel !== DEFAULT_COURSE_FILTERS.classLevel ||
    filters.targetExam !== DEFAULT_COURSE_FILTERS.targetExam ||
    filters.instructorId !== DEFAULT_COURSE_FILTERS.instructorId;

  if (error instanceof Error) {
    return (
      <BatchTestsErrorState
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <CoursesHeader
        onCreate={() => {
          setEditing(null);

          setOpen(true);
        }}
      />

      <CourseFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        instructors={instructors}
        isInstructorsLoading={isInstructorsLoading}
      />

      {isLoading ? (
        <>
          <TableSkeleton rows={4} columns={9} showTableHeader />

          <CardSkeleton extraFields={4} />
        </>
      ) : !data || data.items.length === 0 ? (
        <CoursesEmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={() => {
            setSearchInput("");

            setFilters(DEFAULT_COURSE_FILTERS);
          }}
          onCreateCourse={() => {
            setEditing(null);

            setOpen(true);
          }}
        />
      ) : (
        <>
          <CoursesTable
            data={data.items}
            onEdit={(course) => {
              setEditing(course);

              setOpen(true);
            }}
          />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.total}
            pageSize={data.pageSize}
            onPageChange={(page) =>
              setFilters((prev) => ({
                ...prev,
                page,
              }))
            }
          />
        </>
      )}

      <CourseDialog
        key={editing?.id ?? "create"}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);

          if (!nextOpen) {
            setEditing(null);
          }
        }}
        course={editing ?? undefined}
        instructors={instructors}
        isInstructorsLoading={isInstructorsLoading}
      />
    </>
  );
}
