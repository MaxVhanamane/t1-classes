import { getDistributionsByStatus } from "../actions/get-distributions-by-status";
import { DistributionStatus } from "../types/distribution.types";
import { DistributionRowCard } from "./distribution-row-card";

interface Props {
  status: string;
  search: string;
  page: number;
}

export async function DistributionsList({ status, search, page }: Props) {
  const data = await getDistributionsByStatus({
    status: status as DistributionStatus,
    search,
    page,
  });

  if (data.items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-12">
        No distributions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((d) => (
        <DistributionRowCard key={d.id} item={d} />
      ))}

      <div className="flex justify-between pt-4">
        <span className="text-xs text-muted-foreground">Page {data.page}</span>

        <div className="flex gap-2">
          {data.page > 1 && (
            <a
              href={`?status=${status}&q=${search}&page=${data.page - 1}`}
              className="text-sm underline"
            >
              Previous
            </a>
          )}

          {data.hasMore && (
            <a
              href={`?status=${status}&q=${search}&page=${data.page + 1}`}
              className="text-sm underline"
            >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
