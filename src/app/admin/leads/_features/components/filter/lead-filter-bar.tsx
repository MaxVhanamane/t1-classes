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
  LeadFilters,
  DEFAULT_LEAD_FILTERS,
  LEAD_STATUS_LABELS,
} from "../../types/lead.types";

type Props = {
  filters: LeadFilters;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (filters: LeadFilters) => void;
};

export function LeadFilterBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
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
    onFiltersChange(DEFAULT_LEAD_FILTERS);
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 mb-6">
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Search by Name, Email, Phone */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="mr-2 size-4" />
          Search
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4 lg:max-w-[800px]">
        {/* Target Filter */}
        <Select
          value={filters.targetType}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              targetType: value as LeadFilters["targetType"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Targets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Targets</SelectItem>
            <SelectItem value="course">Course Only</SelectItem>
            <SelectItem value="batch">Batch Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value as LeadFilters["status"],
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full md:w-fit"
        >
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
