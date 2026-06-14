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

import type { TestFilters } from "../../types/test-filters";

import {
  DEFAULT_TEST_FILTERS,
  TEST_LOCKED_FILTERS,
} from "../../constants/test-filters.constants";

import type { TestType } from "../../types/test.types";
import { TestCreatedByCombobox } from "./test-created-by-combobox";

type Props = {
  filters: TestFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: TestFilters) => void;

  instructors: InstructorOption[];

  isInstructorsLoading: boolean;

  isAdmin: boolean;

  currentUserId: string;
};

const TEST_TYPES: TestType[] = ["standard", "sectioned"];

export function TestFiltersBar({
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

    onFiltersChange(DEFAULT_TEST_FILTERS);
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* Test Type */}
        <Select
          value={filters.testType ?? undefined}
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

        {/* Locked */}
        <Select
          value={filters.locked}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              locked: value as TestFilters["locked"],

              page: 1,
            })
          }
        >
          <SelectTrigger className="min-w-32">
            <SelectValue placeholder="Lock Status" />
          </SelectTrigger>

          <SelectContent>
            {TEST_LOCKED_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Tests"
                  : value === "locked"
                    ? "Locked"
                    : "Unlocked"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Created By */}
        {isAdmin && (
          <TestCreatedByCombobox
            value={filters.createdBy}
            staff={instructors}
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
