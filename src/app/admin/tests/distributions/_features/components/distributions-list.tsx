import { getDistributionsByStatus } from "../server/get-distributions-by-status";
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
    const statusLabel =
      status === "all" ? "distributions" : `${status} distributions`;

    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 px-6 text-center">
        <p className="text-sm font-medium">No {statusLabel} found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          There are no {statusLabel} available right now.
        </p>
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
