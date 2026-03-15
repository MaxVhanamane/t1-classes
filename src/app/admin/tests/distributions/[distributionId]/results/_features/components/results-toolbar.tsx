"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Search } from "lucide-react";
import { ResultsSort } from "../types/results.types";

interface Props {
  search: string;
  sort: ResultsSort;
  pageSize: number;
  onSearch: (v: string) => void;
  onSort: (v: ResultsSort) => void;
  onPageSize: (v: number) => void;
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
    <div className="flex flex-col sm:flex-row gap-3 justify-between">
      <div className="flex gap-2">
        <Select value={sort} onValueChange={(v) => onSort(v as ResultsSort)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="name">Student Name</SelectItem>
            <SelectItem value="rank">Rank</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="time">Time Spent</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pageSize.toString()}
          onValueChange={(v) => onPageSize(Number(v))}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative sm:w-64">
        <Input
          placeholder="Search student..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(query.trim());
            }
          }}
          className="pr-9"
        />

        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={() => onSearch(query.trim())}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
