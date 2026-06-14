"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  ENROLLMENT_ACCESS_FILTERS,
  ENROLLMENT_FEE_PLAN_REVISION_FILTERS,
  ENROLLMENT_FEE_STATUS_FILTERS,
} from "../../constants/enrollment-filters.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { CourseFilterCombobox } from "@/src/app/admin/batches/_features/components/filter/course-filter-combobox";

import type { EnrollmentFilters } from "../../types/enrollment-filters";

import type { BatchOption, CourseOption } from "../../types/enrollments.types";

import {
  DEFAULT_ENROLLMENT_FILTERS,
  ENROLLMENT_ACTIVE_FILTERS,
  ENROLLMENT_REGISTRATION_CHANNEL_FILTERS,
  ENROLLMENT_TARGET_TYPE_FILTERS,
  ENROLLMENT_TYPE_FILTERS,
} from "../../constants/enrollment-filters.constants";
import { BatchFilterCombobox } from "./batch-filter-combobox";

type Props = {
  filters: EnrollmentFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: EnrollmentFilters) => void;

  batches: BatchOption[];

  isBatchesLoading: boolean;

  courses: CourseOption[];

  isCoursesLoading: boolean;
};

export function EnrollmentFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  batches,
  isBatchesLoading,
  courses,
  isCoursesLoading,
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

    onFiltersChange(DEFAULT_ENROLLMENT_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search students by name or phone..."
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {/* Active */}
        <Select
          value={filters.active}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              active: value as EnrollmentFilters["active"],

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_ACTIVE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Enrollments"
                  : value === "active"
                    ? "Active"
                    : "Inactive"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Target Type */}
        <Select
          value={filters.targetType}
          onValueChange={(value) => {
            const targetType = value as EnrollmentFilters["targetType"];

            onFiltersChange({
              ...filters,

              targetType,

              batchId:
                targetType === "course" || targetType === "all"
                  ? null
                  : filters.batchId,

              courseId:
                targetType === "batch" || targetType === "all"
                  ? null
                  : filters.courseId,

              page: 1,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Target" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_TARGET_TYPE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Targets"
                  : value === "batch"
                    ? "Batch"
                    : "Course"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.feeStatus}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              feeStatus: value as EnrollmentFilters["feeStatus"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Fee Status" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_FEE_STATUS_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Fee Statuses"
                  : value === "no_fee_plan"
                    ? "No Fee Plan"
                    : value === "pending"
                      ? "Pending"
                      : value === "paid"
                        ? "Paid"
                        : "Overpaid"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.feePlanRevision}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              feePlanRevision: value as EnrollmentFilters["feePlanRevision"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Fee Revisions" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_FEE_PLAN_REVISION_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Plans"
                  : value === "revised"
                    ? "Revised"
                    : "Never Revised"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.access}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              access: value as EnrollmentFilters["access"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Access Status" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_ACCESS_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Access"
                  : value === "ongoing"
                    ? "Ongoing"
                    : value === "upcoming"
                      ? "Upcoming"
                      : "Ended"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Enrollment Type */}
        <Select
          value={filters.enrollmentType}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              enrollmentType: value as EnrollmentFilters["enrollmentType"],

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Enrollment Type" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_TYPE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Types"
                  : value === "standard"
                    ? "Standard"
                    : value === "scholarship"
                      ? "Scholarship"
                      : value === "trial"
                        ? "Trial"
                        : "Internal"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Registration Channel */}
        <Select
          value={filters.registrationChannel}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              registrationChannel:
                value as EnrollmentFilters["registrationChannel"],

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Registration" />
          </SelectTrigger>

          <SelectContent>
            {ENROLLMENT_REGISTRATION_CHANNEL_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Channels"
                  : value === "online"
                    ? "Online"
                    : "Offline"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Batch */}
        <BatchFilterCombobox
          value={filters.batchId}
          batches={batches}
          isLoading={isBatchesLoading}
          disabled={filters.targetType === "course"}
          onChange={(batchId) =>
            onFiltersChange({
              ...filters,

              batchId,

              courseId: null,

              targetType:
                batchId !== null
                  ? "batch"
                  : filters.courseId
                    ? "course"
                    : "all",

              page: 1,
            })
          }
        />

        {/* Course */}
        <CourseFilterCombobox
          value={filters.courseId}
          courses={courses.map((course) => ({
            id: course.id,

            title: course.title,

            is_active: true,
          }))}
          disabled={filters.targetType === "batch"}
          isLoading={isCoursesLoading}
          onChange={(courseId) =>
            onFiltersChange({
              ...filters,

              courseId,

              batchId: null,

              targetType:
                courseId !== null
                  ? "course"
                  : filters.batchId
                    ? "batch"
                    : "all",

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
