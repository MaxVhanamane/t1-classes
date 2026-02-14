import { ExploreBatchCard } from "./ExploreBatchCard";
import { cookies } from "next/headers";
import { SectionError } from "@/src/components/system/SectionError";
import { ExploreBatch } from "@/src/app/api/explore-batches/types";

export async function ExploreBatches() {
  let batches: ExploreBatch[] | null = null;
  let fetchError = false;

  try {
    const cookieStore = await cookies();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/explore-batches`,
      {
        method: "GET",
        headers: {
          cookie: cookieStore.toString(),
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      // console.error("Explore batches API failed:", res.status);
      fetchError = true;
    } else {
      batches = await res.json();
    }
  } catch {
    // console.error("Explore batches fetch crashed:", error);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <SectionError
        title="Failed to load batches"
        message="We couldn’t fetch available batches right now."
      />
    );
  }

  if (!batches || batches.length === 0) {
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
