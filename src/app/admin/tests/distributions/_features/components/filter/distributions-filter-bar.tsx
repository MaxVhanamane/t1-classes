"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import type { InstructorOption } from "@/src/app/admin/courses/_features/types/course.types";

import { DistributionTabs } from "../distribution-tabs";
import { DEFAULT_DISTRIBUTION_FILTERS } from "../../constants/distribution-filters.constants";
import { DistributionStatus } from "../../types/distribution.types";
import { DistributionFilters } from "../../types/distribution-filters";
import { CreatedByCombobox } from "../../../../_features/components/filter/created-by-combobox";

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
      {/* TOP: Search and Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input Area */}
        <div className="flex flex-1 gap-2">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
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
            <Search className="mr-2 size-4 hidden sm:inline-block" />
            Search
          </Button>
        </div>

        {/* Action Filters Area */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

          <Button variant="outline" onClick={handleReset} className="w-fit">
            <RotateCcw className="mr-2 size-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* BOTTOM: Tabs */}
      <div className="pt-2">
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
      </div>
    </div>
  );
}
