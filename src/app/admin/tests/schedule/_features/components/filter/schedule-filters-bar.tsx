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

import type { InstructorOption } from "@/src/app/admin/courses/_features/types/course.types";
import { ScheduleFilters } from "../../types/schedule-filters";
import { TestType } from "../../../../_features/types/test.types";
import { DEFAULT_SCHEDULE_FILTERS } from "../../constants/schedule-filters.constants";
import { CreatedByCombobox } from "../../../../_features/components/filter/created-by-combobox";

type Props = {
  filters: ScheduleFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: ScheduleFilters) => void;

  instructors: InstructorOption[];

  isInstructorsLoading: boolean;

  isAdmin: boolean;

  currentUserId: string;
};

const TEST_TYPES: TestType[] = ["standard", "sectioned"];

export function ScheduleFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  instructors,
  isInstructorsLoading,
  isAdmin,
  currentUserId,
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

    onFiltersChange(DEFAULT_SCHEDULE_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search tests..."
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
      <div
        className={
          isAdmin
            ? "grid gap-3 md:grid-cols-2 lg:grid-cols-3"
            : "grid gap-3 md:grid-cols-2"
        }
      >
        {/* Test Type */}
        <Select
          value={filters.testType ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              testType: value === "__all__" ? null : (value as TestType),

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Test Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>

            {TEST_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "standard" ? "Standard" : "Sectioned"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Created By */}
        {isAdmin && (
          <CreatedByCombobox
            value={filters.createdBy}
            instructors={instructors}
            currentUserId={currentUserId}
            isLoading={isInstructorsLoading}
            onChange={(createdBy) =>
              onFiltersChange({
                ...filters,

                createdBy,

                page: 1,
              })
            }
          />
        )}

        {/* Reset */}
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
