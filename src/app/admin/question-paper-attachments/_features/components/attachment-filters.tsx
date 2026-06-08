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
  TARGET_EXAMS,
  TARGET_EXAM_LABELS,
} from "../../../batches/_features/zod-schema/schema";
import { AttachmentFiltersType } from "../types/attachment-filters";

type AttachmentFiltersProps = {
  filters: AttachmentFiltersType;

  searchInput: string;

  onSearchInputChange: (value: string) => void;

  onFiltersChange: (filters: AttachmentFiltersType) => void;
};

export function AttachmentFilters({
  filters,
  searchInput,
  onSearchInputChange,
  onFiltersChange,
}: AttachmentFiltersProps) {
  function handleSearch() {
    onFiltersChange({
      ...filters,
      search: searchInput.trim(),
      page: 1,
    });
  }

  function handleReset() {
    onSearchInputChange("");

    onFiltersChange({
      ...filters,
      search: "",
      classLevel: null,
      targetExam: null,
      page: 1,
    });
  }

  return (
    <div className="bg-card space-y-4 rounded-lg border p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

          <Input
            placeholder="Search..."
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

      <div className="grid gap-3 lg:grid-cols-3">
        <Select
          value={filters.classLevel?.toString() ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              classLevel: value === "__all__" ? null : Number(value),

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue>
              {filters.classLevel
                ? `Class ${filters.classLevel}`
                : "All Classes"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Classes</SelectItem>

            {[6, 7, 8, 9, 10, 11, 12].map((level) => (
              <SelectItem key={level} value={String(level)}>
                Class {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.targetExam ?? "__all__"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,

              targetExam: value === "__all__" ? null : value,

              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue>
              {filters.targetExam
                ? TARGET_EXAM_LABELS[
                    filters.targetExam as keyof typeof TARGET_EXAM_LABELS
                  ]
                : "All Exams"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__all__">All Exams</SelectItem>

            {TARGET_EXAMS.map((exam) => (
              <SelectItem key={exam} value={exam}>
                {TARGET_EXAM_LABELS[exam]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 size-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
