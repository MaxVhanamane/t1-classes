"use client";

import { Button } from "@/src/components/ui/button";

type Props = {
  page: number;

  totalPages: number;

  totalCount: number;

  onPageChange: (page: number) => void;
};

export default function UsersPagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1,
  );

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      {/* ---------- Info ---------- */}

      <div className="text-sm text-muted-foreground">
        Total Users:{" "}
        <span className="font-medium text-foreground">{totalCount}</span>
      </div>

      {/* ---------- Controls ---------- */}

      <div className="flex flex-wrap items-center gap-2">
        {/* Previous */}

        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        {/* Pages */}

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            size="sm"
            variant={page === pageNumber ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        {/* Next */}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
