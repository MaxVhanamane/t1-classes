"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { DistributionTabs } from "./distribution-tabs";
import { Search, X } from "lucide-react";

interface Props {
  status: string;
  search: string;
}

export function DistributionsToolbar({ status, search }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  // Local input state (decoupled from URL)
  const [query, setQuery] = useState(search);

  // Keep input synced with URL (back/forward, tab changes, etc)
  useEffect(() => {
    setQuery(search);
  }, [search]);

  function pushParams(next: URLSearchParams) {
    next.set("page", "1");
    router.push(`?${next.toString()}`);
  }

  function applySearch() {
    const p = new URLSearchParams(params.toString());

    if (query.trim()) {
      p.set("q", query.trim());
    } else {
      p.delete("q");
    }

    pushParams(p);
  }

  function clearSearch() {
    const p = new URLSearchParams(params.toString());
    p.delete("q");
    pushParams(p);
  }

  function updateStatus(value: string) {
    const p = new URLSearchParams(params.toString());
    p.set("status", value);
    pushParams(p);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between">
      <DistributionTabs value={status} onChange={updateStatus} />

      <div className="relative sm:w-64">
        <Input
          placeholder="Search test title..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);

            // AUTO-CLEAR URL when input becomes empty
            if (val.trim() === "") {
              clearSearch();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applySearch();
            }
          }}
          className="pr-16"
        />

        {/* Clear button */}
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-8 top-1 h-7 w-7"
            onClick={() => {
              setQuery("");
              clearSearch();
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Search button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={applySearch}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
