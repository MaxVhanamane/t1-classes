"use client";

import { useState } from "react";

import { Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { ResultsSort } from "../types/results.types";

interface Props {
  search: string;
  sort: ResultsSort;
  pageSize: number;
  onSearch: (value: string) => void;
  onSort: (value: ResultsSort) => void;
  onPageSize: (value: number) => void;
}

export function ResultsToolbar({
  search,
  sort,
  pageSize,
  onSearch,
  onSort,
  onPageSize,
}: Props) {
  const [query, setQuery] = useState(search);

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row">
      <div className="flex flex-wrap gap-2">
        <Select
          value={sort}
          onValueChange={(value) => onSort(value as ResultsSort)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="rank">Rank</SelectItem>

            <SelectItem value="name">Student Name</SelectItem>

            <SelectItem value="time">Time Spent</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSize(Number(value))}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="25">25 / page</SelectItem>

            <SelectItem value="50">50 / page</SelectItem>

            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative sm:w-72">
        <Input
          placeholder="Search by student name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(query.trim());
            }
          }}
          className="pr-10"
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-8 w-8"
          onClick={() => onSearch(query.trim())}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
