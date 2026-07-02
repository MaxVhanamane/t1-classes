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
  DEFAULT_NOTIFICATION_FILTERS,
  NOTIFICATION_TYPE_FILTERS,
} from "../../constants/notification-filters.constants";
import { NotificationFilters } from "../../types/notification-filters";
import { BatchFilterCombobox } from "@/src/app/admin/enrollments/_features/components/filter/batch-filter-combobox";
type BatchOption = {
  id: string;
  title: string;
};

type Props = {
  filters: NotificationFilters;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: NotificationFilters) => void;

  batches: BatchOption[];

  isBatchesLoading: boolean;
};

export function NotificationFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  batches,
  isBatchesLoading,
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

    onFiltersChange(DEFAULT_NOTIFICATION_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search notifications..."
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {/* Type */}
        <Select
          value={filters.type}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              type: value as NotificationFilters["type"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Notification Type" />
          </SelectTrigger>

          <SelectContent>
            {NOTIFICATION_TYPE_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all"
                  ? "All Types"
                  : value
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Batch */}
        <BatchFilterCombobox
          value={filters.batchId}
          batches={batches}
          isLoading={isBatchesLoading}
          onChange={(batchId) =>
            onFiltersChange({
              ...filters,
              batchId,
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
