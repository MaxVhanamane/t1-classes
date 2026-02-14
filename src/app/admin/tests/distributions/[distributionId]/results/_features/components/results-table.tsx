import { getDistributionResults } from "../actions/get-distribution-results";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ResultsSort } from "../types/results.types";

interface Props {
  distributionId: string;
  page: number;
  pageSize: number;
  search: string;
  sort: ResultsSort;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export async function ResultsTable({
  distributionId,
  page,
  pageSize,
  search,
  sort,
}: Props) {
  const data = await getDistributionResults({
    distributionId,
    page,
    pageSize,
    search,
    sort,
  });

  if (data.items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-12">
        No results found
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Student</th>
              <th className="p-3">Score</th>
              <th className="p-3">Accuracy</th>
              <th className="p-3">Time</th>
              <th className="p-3">Rank</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.items.map((row) => {
              const accuracy =
                row.total_marks > 0
                  ? Math.round(
                      (row.correct_count /
                        (row.correct_count +
                          row.wrong_count +
                          row.unanswered_count)) *
                        100,
                    )
                  : 0;

              return (
                <tr
                  key={row.id}
                  className="border-t hover:bg-muted/40 transition"
                >
                  <td className="p-3">
                    <div className="font-medium">{row.student_name}</div>
                    {row.student_email && (
                      <div className="text-xs text-muted-foreground">
                        {row.student_email}
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    {row.obtained_marks} / {row.total_marks}
                  </td>

                  <td className="p-3">
                    <Badge variant="outline">{accuracy}%</Badge>
                  </td>

                  <td className="p-3">{formatTime(row.time_spent_seconds)}</td>

                  <td className="p-3">{row.rank ?? "—"}</td>

                  <td className="p-3">
                    <Button size="sm" variant="outline">
                      View Attempt
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-3 border-t text-sm">
        <span>
          Page {data.page} of {Math.ceil(data.total / data.pageSize)}
        </span>

        <div className="flex gap-2">
          {data.page > 1 && (
            <a href={`?page=${data.page - 1}`} className="underline">
              Previous
            </a>
          )}

          {data.hasMore && (
            <a href={`?page=${data.page + 1}`} className="underline">
              Next
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
