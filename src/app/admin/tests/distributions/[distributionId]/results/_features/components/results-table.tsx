"use client";

import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { DistributionResultRow } from "../types/results.types";

interface Props {
  items: DistributionResultRow[];
  isFetching?: boolean;
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${secs}s`;
}

export function ResultsTable({ items, isFetching = false }: Props) {
  return (
    <Card className="overflow-hidden">
      <div
        className={
          isFetching ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>

              <TableHead>Rank</TableHead>
              <TableHead>Score</TableHead>

              <TableHead>Percentage</TableHead>

              <TableHead>Percentile</TableHead>

              <TableHead>Correct</TableHead>

              <TableHead>Partial</TableHead>

              <TableHead>Wrong</TableHead>

              <TableHead>Unanswered</TableHead>

              <TableHead>Completion</TableHead>

              <TableHead>Time Spent</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((row) => {
              const percentage =
                row.total_marks > 0
                  ? Number(
                      ((row.obtained_marks / row.total_marks) * 100).toFixed(2),
                    )
                  : 0;

              return (
                <TableRow key={row.id}>
                  <TableCell className="max-w-52">
                    <div
                      className="truncate font-medium"
                      title={row.student_name}
                    >
                      {row.student_name}
                    </div>

                    {row.student_email && (
                      <div
                        className="truncate text-xs text-muted-foreground"
                        title={row.student_email}
                      >
                        {row.student_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{row.rank ?? "—"}</TableCell>

                  <TableCell>
                    {row.obtained_marks} / {row.total_marks}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </TableCell>

                  <TableCell>
                    {row.percentile !== null ? (
                      <Badge variant="outline">{row.percentile}%</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="font-medium text-green-600">
                    {row.correct_count}
                  </TableCell>

                  <TableCell className="font-medium text-blue-600">
                    {row.partial_correct_count}
                  </TableCell>

                  <TableCell className="font-medium text-red-500">
                    {row.wrong_count}
                  </TableCell>

                  <TableCell className="font-medium text-yellow-600">
                    {row.unanswered_count}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {row.completion_percentage}%
                    </Badge>
                  </TableCell>

                  <TableCell>{formatTime(row.time_spent_seconds)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

ResultsTable.Skeleton = function ResultsTableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>

            <TableHead>Score</TableHead>

            <TableHead>Percentage</TableHead>

            <TableHead>Percentile</TableHead>

            <TableHead>Rank</TableHead>

            <TableHead>Correct</TableHead>

            <TableHead>Partial</TableHead>

            <TableHead>Wrong</TableHead>

            <TableHead>Unanswered</TableHead>

            <TableHead>Completion</TableHead>

            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({
            length: 10,
          }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />

                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-10" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
