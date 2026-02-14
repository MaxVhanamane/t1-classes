import { Separator } from "@/src/components/ui/separator";
import { getPagedTests } from "./_features/actions/get-paged-tests";
import { ScheduleTestsClient } from "./_features/components/schedule-tests-client";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

const PAGE_SIZE = 10;

export default async function ScheduleTestsPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1"));
  const search = params.q ?? "";

  const result = await getPagedTests({
    page,
    pageSize: PAGE_SIZE,
    search,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Schedule Tests
          </h1>
          <p className="text-sm text-muted-foreground">
            Assign tests to batches, courses, or marketing audiences
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/tests/distributions">View Scheduled Tests</Link>
        </Button>
      </header>
      <Separator />

      <ScheduleTestsClient data={result} search={search} />
    </div>
  );
}
