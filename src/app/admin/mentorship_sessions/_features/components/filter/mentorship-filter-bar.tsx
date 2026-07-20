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

import { BatchFilterCombobox } from "@/src/app/admin/enrollments/_features/components/filter/batch-filter-combobox";
import { CreatedByCombobox } from "@/src/app/admin/tests/_features/components/filter/created-by-combobox";

import type { InstructorOption } from "@/src/app/admin/courses/_features/types/course.types";
import type { MentorshipSessionFilters } from "../../types/mentorship-filters";

import {
  DEFAULT_MENTORSHIP_FILTERS,
  MENTORSHIP_AUDIENCE_FILTERS,
  MENTORSHIP_STATUS_FILTERS,
} from "../../constants/mentorship-filters";

type BatchOption = {
  id: string;
  title: string;
};

type Props = {
  filters: MentorshipSessionFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: MentorshipSessionFilters) => void;

  batches: BatchOption[];

  isBatchesLoading: boolean;

  instructors: InstructorOption[];

  isInstructorsLoading: boolean;

  isAdmin: boolean;

  currentUserId: string;
};

export function MentorshipFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  batches,
  isBatchesLoading,
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

    onFiltersChange(DEFAULT_MENTORSHIP_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search mentorship sessions..."
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
        {/* Batch */}
        <BatchFilterCombobox
          value={filters.batchId === "all" ? null : filters.batchId}
          batches={batches}
          isLoading={isBatchesLoading}
          onChange={(batchId) =>
            onFiltersChange({
              ...filters,
              batchId: batchId ?? "all",
              page: 1,
            })
          }
        />

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as MentorshipSessionFilters["status"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {MENTORSHIP_STATUS_FILTERS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Audience */}
        <Select
          value={filters.audienceType}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              audienceType: value as MentorshipSessionFilters["audienceType"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Audience" />
          </SelectTrigger>

          <SelectContent>
            {MENTORSHIP_AUDIENCE_FILTERS.map((audience) => (
              <SelectItem key={audience.value} value={audience.value}>
                {audience.label}
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
