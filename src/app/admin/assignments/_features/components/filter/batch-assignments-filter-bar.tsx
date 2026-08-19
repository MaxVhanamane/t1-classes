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
import { BatchAssignmentFilters } from "../../types/batch-assignments.types";
import {
  ASSIGNMENT_STATUS_FILTERS,
  DEFAULT_ASSIGNMENT_FILTERS,
} from "../../constants/batch-assignment-filters.constants";
import { cn } from "@/src/lib/utils";

type Props = {
  filters: BatchAssignmentFilters;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (filters: BatchAssignmentFilters) => void;
  subjects: string[];
};

export function BatchAssignmentsFilterBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
  subjects,
}: Props) {
  function handleSearch() {
    onFiltersChange({ ...filters, search: searchInput.trim(), page: 1 });
  }

  function handleReset() {
    onSearchInputChange("");
    onFiltersChange(DEFAULT_ASSIGNMENT_FILTERS);
  }

  return (
    <div className={cn("space-y-4 rounded-lg border bg-card p-4")}>
      {/* Search */}
      <div className={cn("flex flex-col gap-3 md:flex-row")}>
        <div className={cn("relative flex-1")}>
          <Search
            className={cn(
              "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
            )}
          />
          <Input
            placeholder="Search material title..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className={cn("pl-9")}
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className={cn("mr-2 size-4")} />
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className={cn("flex flex-wrap items-center gap-3")}>
        <Select
          value={filters.subject}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, subject: value, page: 1 })
          }
        >
          <SelectTrigger className={cn("w-[180px]")}>
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((sub) => (
              <SelectItem key={sub} value={sub} className={cn("capitalize")}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as BatchAssignmentFilters["status"],
              page: 1,
            })
          }
        >
          <SelectTrigger className={cn("w-[180px]")}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNMENT_STATUS_FILTERS.map((val) => (
              <SelectItem key={val} value={val} className={cn("capitalize")}>
                {val === "all" ? "All Statuses" : val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleReset}
          className={cn("ml-auto")}
        >
          <RotateCcw className={cn("mr-2 size-4")} />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
