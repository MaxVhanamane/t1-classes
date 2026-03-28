import { Separator } from "@/src/components/ui/separator";
import { getPagedTests } from "./_features/server/get-paged-tests";
import { ScheduleTestsClient } from "./_features/components/schedule-tests-client";
import { Link } from "@/src/components/ui/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="mx-auto w-full max-w-5xl px-4 py-0 space-y-6 ">
      <Link
        href="/admin/tests"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tests
      </Link>

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
      </header>

      <Separator />

      <ScheduleTestsClient data={result} search={search} />
    </div>
  );
}
