import { getExploreBatches } from "../actions/getExploreBatches";
import { ExploreBatchCard } from "./ExploreBatchCard";

export async function ExploreBatches() {
  const batches = await getExploreBatches();

  if (batches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No batches available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {batches.map((batch) => (
        <ExploreBatchCard key={batch.id} batch={batch} />
      ))}
    </div>
  );
}
