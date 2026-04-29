"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/src/components/ui/hover-card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { Pencil, Trash2 } from "lucide-react";

import { LiveClassRow } from "../types/live-class.types";

interface Props {
  rows: LiveClassRow[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (row: LiveClassRow) => void;
  onDelete: (row: LiveClassRow) => void;
}

function getStatus(start: string, end: string) {
  const now = new Date();
  const startsAt = new Date(start);
  const endsAt = new Date(end);

  if (now < startsAt) return "Upcoming";
  if (now >= startsAt && now <= endsAt) return "Live";

  return "Completed";
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function truncate(value: string, max = 22): string {
  if (value.length <= max) return value;

  return `${value.slice(0, max)}...`;
}

function BatchChip({ title }: { title: string }) {
  const chip = (
    <span className="inline-flex cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors hover:bg-muted">
      {truncate(title)}
    </span>
  );

  return (
    <>
      <div className="hidden sm:block">
        <HoverCard openDelay={150} closeDelay={80}>
          <HoverCardTrigger asChild>{chip}</HoverCardTrigger>

          <HoverCardContent
            className="w-auto max-w-xs px-3 py-2 text-sm"
            align="start"
          >
            {title}
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>{chip}</PopoverTrigger>

          <PopoverContent
            className="w-auto max-w-xs px-3 py-2 text-sm"
            align="start"
          >
            {title}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

export function LiveClassesTable({
  rows,
  loading,
  page,
  total,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Batches</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              Array.from({
                length: 8,
              }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>

                  <TableCell>{getStatus(row.starts_at, row.ends_at)}</TableCell>

                  <TableCell>{formatDateTime(row.starts_at)}</TableCell>

                  <TableCell>{formatDateTime(row.ends_at)}</TableCell>

                  <TableCell className="max-w-65">
                    <div className="flex flex-wrap gap-1">
                      {row.batches.map((batch) => (
                        <BatchChip key={batch.id} title={batch.title} />
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>{row.created_by_name ?? "-"}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(row)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(row)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No live classes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
