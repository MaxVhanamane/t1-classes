"use client";

import { Button } from "@/src/components/ui/button";
import { ExternalLink, Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { LiveClass } from "../types/live-class.types";
import { DateTimeCell } from "@/src/components/ui/common/date-time-cell";
import { EditButton } from "@/src/components/ui/common/edit-button";
import { DeleteButton } from "@/src/components/ui/common/delete-button";
import {
  GreenBadge,
  NeutralBadge,
  YellowBadge,
} from "@/src/components/ui/common/colored-badges";

interface Props {
  classes: LiveClass[];
  onEdit: (row: LiveClass) => void;
  onDelete: (row: LiveClass) => void;
}

function truncate(value: string, max = 22) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max)}...`;
}

function StatusBadge({ status }: { status: LiveClass["status"] }) {
  switch (status) {
    case "live":
      return <GreenBadge showDot>Live</GreenBadge>;

    case "upcoming":
      return <YellowBadge showDot>Upcoming</YellowBadge>;

    case "ended":
      return <NeutralBadge showDot>Ended</NeutralBadge>;

    default:
      return null;
  }
}

export function LiveClassesTable({ classes, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="sticky left-0 z-20 w-16 bg-secondary text-center font-medium">
              No.
            </TableHead>
            <TableHead className="min-w-50">Title</TableHead>
            <TableHead>Batches</TableHead>
            <TableHead className="w-26">Status</TableHead>
            <TableHead>YouTube</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Ends</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {classes.map((row, index) => (
            <TableRow
              key={row.id}
              className="group transition-colors hover:bg-muted/30"
            >
              <TableCell className="sticky left-0 z-20 w-14 min-w-14 bg-card text-center font-semibold transition-colors group-hover:bg-muted/0">
                {index + 1}
              </TableCell>
              <TableCell className="max-w-50">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{row.title}</p>

                    {row.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        No description
                      </p>
                    )}
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                      >
                        <Info className="size-4" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="max-w-sm bg-card" align="end">
                      <div className="space-y-3">
                        <p className="wrap-break-word font-medium">
                          {row.title}
                        </p>

                        <p className="wrap-break-word whitespace-pre-wrap text-sm text-muted-foreground">
                          {row.description?.trim() ||
                            "No description has been added for this live class."}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableCell>
              <TableCell className="max-w-72">
                <div className="flex items-center gap-2">
                  <span
                    className="truncate rounded-md border border-sky-200/60 bg-sky-50/80 px-2 py-1 text-xs font-medium text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-300"
                    title={row.batch_titles[0]}
                  >
                    {truncate(row.batch_titles[0])}
                  </span>

                  {row.batch_titles.length > 1 && (
                    <span
                      className="inline-flex h-6 shrink-0 items-center justify-center rounded-md border border-sky-200/60 bg-sky-50/80 px-2 text-[11px] font-semibold text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-300"
                      title={`${row.batch_titles.length - 1} more batch${
                        row.batch_titles.length - 1 > 1 ? "es" : ""
                      }`}
                    >
                      +{row.batch_titles.length - 1}
                    </span>
                  )}

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Info className="size-4" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent align="start" className="w-80 bg-card">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Associated Batches</h4>

                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {row.batch_titles.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {row.batch_titles.map((batch, index) => (
                            <div
                              key={batch}
                              className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                            >
                              <span className="mt-0.5 text-xs font-semibold text-muted-foreground">
                                {index + 1}.
                              </span>

                              <p className="text-sm leading-relaxed">{batch}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableCell>
              <TableCell className="w-26">
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell>
                <a
                  href={`https://www.youtube.com/watch?v=${row.youtube_live_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200/60 bg-indigo-50/70 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                >
                  <ExternalLink className="size-3.5" />
                  Open Link
                </a>
              </TableCell>
              <TableCell>
                <DateTimeCell value={row.starts_at} />
              </TableCell>

              <TableCell>
                <DateTimeCell value={row.ends_at} />
              </TableCell>

              <TableCell className="max-w-40">
                <div className="flex items-center gap-2">
                  <span
                    title={row.creator_name ?? "-"}
                    className="truncate rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {row.creator_name ?? "-"}
                  </span>

                  {row.creator_name && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <Info className="size-3.5" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="max-w-sm wrap-break-word bg-card">
                        {row.creator_name}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditButton onClick={() => onEdit(row)} />

                  <DeleteButton onClick={() => onDelete(row)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
