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
import type { LiveClassFilters } from "../types/live-class-filters";

import {
  DEFAULT_LIVE_CLASS_FILTERS,
  LIVE_CLASS_STATUS_FILTERS,
} from "../../constants/live-class-filters";

type BatchOption = {
  id: string;
  title: string;
};

type Props = {
  filters: LiveClassFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: LiveClassFilters) => void;

  batches: BatchOption[];

  isBatchesLoading: boolean;

  instructors: InstructorOption[];

  isInstructorsLoading: boolean;

  isAdmin: boolean;

  currentUserId: string;

  isAuthLoading: boolean;
};

export function LiveClassFiltersBar({
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
  isAuthLoading,
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

    onFiltersChange(DEFAULT_LIVE_CLASS_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search live classes..."
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
      <div className="flex flex-col gap-3 xl:flex-row">
        <div
          className={`grid flex-1 gap-2 ${
            isAdmin ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
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
                status: value as LiveClassFilters["status"],
                page: 1,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              {LIVE_CLASS_STATUS_FILTERS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
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
              isLoading={isInstructorsLoading || isAuthLoading}
              onChange={(createdBy) =>
                onFiltersChange({
                  ...filters,
                  createdBy,
                  page: 1,
                })
              }
            />
          )}
        </div>

        {/* Reset */}
        <Button
          variant="outline"
          onClick={handleReset}
          className="shrink-0 w-fit"
        >
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
