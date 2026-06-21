"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/src/lib/utils";

import { Button } from "@/src/components/ui/button";

type PaginationProps = {
  page: number;

  totalPages: number;

  totalCount: number;

  pageSize: number;

  onPageChange: (page: number) => void;

  className?: string;
  itemLabel?: string;
};

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  className,
  itemLabel = "Items",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;

  const end = Math.min(page * pageSize, totalCount);

  let pages: number[];

  if (totalPages <= 3) {
    pages = Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  } else if (page <= 2) {
    pages = [1, 2, 3];
  } else if (page >= totalPages - 1) {
    pages = [totalPages - 2, totalPages - 1, totalPages];
  } else {
    pages = [page - 1, page, page + 1];
  }

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-muted-foreground text-center text-xs">
        Showing{" "}
        <span className="text-foreground font-medium">
          {itemLabel} {start} to {end}
        </span>{" "}
        of <span className="text-foreground font-medium">{totalCount}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 size-4" />
          Prev
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            size="sm"
            variant={pageNumber === page ? "default" : "outline"}
            className="w-9 shrink-0"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
