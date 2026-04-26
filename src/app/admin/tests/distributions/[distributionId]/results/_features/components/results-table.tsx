"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { Skeleton } from "@/src/components/ui/skeleton";
import { AlertCircle, Loader, Search } from "lucide-react";
import { ResultsSort, PagedResults } from "../types/results.types";
import { fetchWrapper } from "@/src/lib/api/fetch-wrapper";

interface Props {
  distributionId: string;
  page: number;
  pageSize: number;
  search: string;
  sort: ResultsSort;
  onPageChange: (page: number) => void;
}

async function fetchResults(params: {
  distributionId: string;
  page: number;
  pageSize: number;
  search: string;
  sort: ResultsSort;
}): Promise<PagedResults> {
  return fetchWrapper<PagedResults>(
    `/api/admin/distributions/${params.distributionId}/results`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function ResultsTable({
  distributionId,
  page,
  pageSize,
  search,
  sort,
  onPageChange,
}: Props) {
  const { data, isPending, isFetching, isError } = useQuery<PagedResults>({
    queryKey: ["results", distributionId, page, pageSize, search, sort],
    queryFn: () =>
      fetchResults({
        distributionId,
        page,
        pageSize,
        search,
        sort,
      }),
    placeholderData: (prev) => prev,
  });

  if (isPending) {
    return (
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-15" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-17" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-22.5" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex flex-col items-center justify-center py-14 text-center">
        <AlertCircle className="h-6 w-6 text-destructive mb-2" />
        <p className="text-sm font-medium">Failed to load results</p>
        <p className="text-xs text-muted-foreground mt-1">
          Please refresh the page or try again later.
        </p>
      </Card>
    );
  }
  if (data.items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-14 text-center">
        <Search className="h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">No results found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try adjusting your search or filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden relative rounded-lg border bg-card">
      {isFetching && (
        <div className="absolute top-2 right-2">
          <Loader className="animate-spin w-4 h-4" />
        </div>
      )}
      <div
        className={
          isFetching ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Correct</TableHead>
              <TableHead>Wrong</TableHead>
              <TableHead>Unanswered</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead>Rank</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.items.map((row) => {
              const percentage =
                row.total_marks > 0
                  ? Number(
                      ((row.obtained_marks / row.total_marks) * 100).toFixed(2),
                    )
                  : 0;
              return (
                <TableRow key={row.id}>
                  <TableCell className="max-w-30">
                    <div
                      className="font-medium truncate"
                      title={row.student_name}
                    >
                      {row.student_name}
                    </div>

                    {row.student_email && (
                      <div
                        className="text-xs text-muted-foreground truncate"
                        title={row.student_email}
                      >
                        {row.student_email}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {row.obtained_marks} / {row.total_marks}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </TableCell>

                  <TableCell className="text-green-600 font-medium">
                    {row.correct_count}
                  </TableCell>

                  <TableCell className="text-red-500 font-medium">
                    {row.wrong_count}
                  </TableCell>
                  <TableCell className="text-yellow-500 font-medium">
                    {row.unanswered_count}
                  </TableCell>

                  <TableCell>{formatTime(row.time_spent_seconds)}</TableCell>

                  <TableCell>{row.rank ?? "—"}</TableCell>

                  {/* <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      View Attempt
                    </Button>
                  </TableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
        <div className="text-muted-foreground">
          Page {data.page} of {Math.ceil(data.total / data.pageSize)}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1 || isFetching}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={!data.hasMore || isFetching}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
