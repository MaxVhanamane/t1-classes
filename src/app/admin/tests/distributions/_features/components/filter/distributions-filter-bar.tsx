"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import { TestCreatedByCombobox } from "@/src/app/admin/tests/_features/components/filter/test-created-by-combobox";

import type { InstructorOption } from "@/src/app/admin/courses/_features/types/course.types";

import { DistributionTabs } from "../distribution-tabs";
import { DEFAULT_DISTRIBUTION_FILTERS } from "../../constants/distribution-filters.constants";
import { DistributionStatus } from "../../types/distribution.types";
import { DistributionFilters } from "../../types/distribution-filters";

type Props = {
  filters: DistributionFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: DistributionFilters) => void;

  instructors: InstructorOption[];

  isInstructorsLoading: boolean;

  isAdmin: boolean;

  currentUserId: string;
};

export function DistributionFiltersBar({
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

    onFiltersChange(DEFAULT_DISTRIBUTION_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <DistributionTabs
          value={filters.status}
          onChange={(status) =>
            onFiltersChange({
              ...filters,

              status: status as DistributionStatus,

              page: 1,
            })
          }
        />

        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search test title..."
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
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
