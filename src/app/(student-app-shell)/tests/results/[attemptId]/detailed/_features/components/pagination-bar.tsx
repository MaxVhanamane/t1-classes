"use client";

import { Button } from "@/src/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
};

export function PaginationBar({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center pt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
    </div>
  );
}
