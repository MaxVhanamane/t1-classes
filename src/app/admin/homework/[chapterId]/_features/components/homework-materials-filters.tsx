"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import {
  HOMEWORK_TYPES,
  HOMEWORK_DIFFICULTIES,
} from "../constants/homework.constants";
import type { HomeworkMaterialFilters } from "../types/homework";

type HomeworkMaterialFiltersBarProps = {
  filters: HomeworkMaterialFilters;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onFiltersChange: (filters: HomeworkMaterialFilters) => void;
};

export function HomeworkMaterialFiltersBar({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
}: HomeworkMaterialFiltersBarProps) {
  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      search: searchInput.trim(),
      page: 1,
    });
  };

  const handleReset = () => {
    onSearchInputChange("");
    onFiltersChange({
      ...filters,
      search: "",
      homeworkType: null,
      difficulty: null,
      page: 1,
    });
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search materials by title..."
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

      <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
        <Select
          value={filters.homeworkType ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              homeworkType:
                value === "__all__"
                  ? null
                  : (value as typeof filters.homeworkType),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            {HOMEWORK_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              difficulty:
                value === "__all__"
                  ? null
                  : (value as typeof filters.difficulty),
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Difficulties</SelectItem>
            {HOMEWORK_DIFFICULTIES.map((diff) => (
              <SelectItem key={diff.value} value={diff.value}>
                {diff.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleReset} className="w-fit">
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
