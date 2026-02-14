"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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

interface Props {
  search: string;
  sort: string;
  pageSize: number;
}

export function ResultsToolbar({ search, sort, pageSize }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString());

    if (value) p.set(key, value);
    else p.delete(key);

    p.set("page", "1");
    router.push(`?${p.toString()}`);
  }

  function applySearch() {
    updateParam("q", query.trim());
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between">
      <div className="flex gap-2">
        {/* Sort */}
        <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
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

        {/* Page Size */}
        <Select
          value={pageSize.toString()}
          onValueChange={(v) => updateParam("size", v)}
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

      {/* Search */}
      <div className="relative sm:w-64">
        <Input
          placeholder="Search student..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applySearch();
            }
          }}
          className="pr-9"
        />

        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={applySearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
