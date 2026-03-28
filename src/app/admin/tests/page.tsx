import { Link } from "@/src/components/ui/link";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { FileText, CalendarDays, ClipboardList } from "lucide-react";

import { TestsList } from "./_features/components/test-list";
import { getTests } from "./_features/actions/get-tests";

/* ---------------- Skeleton ---------------- */

function TestsListSkeleton() {
  return (
    <div className="space-y-3 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

async function TestsListLoader({ page }: { page: number }) {
  const { tests, totalPages } = await getTests(page);

  return <TestsList tests={tests} currentPage={page} totalPages={totalPages} />;
}

/* ---------------- Page ---------------- */

export default async function AdminTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tests</h1>
        <p className="text-sm text-muted-foreground">
          Create, manage, and schedule reusable tests for students
        </p>
      </header>

      <Separator className="mb-6" />

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="hover:shadow-sm transition">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Create Test</CardTitle>
            </div>
            <CardDescription>
              Build a reusable test with sections and questions
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/tests/create">Create new test</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Schedule Test</CardTitle>
            </div>
            <CardDescription>
              Assign existing tests to batches or courses
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/tests/schedule">Schedule tests</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">View Scheduled Tests</CardTitle>
            </div>
            <CardDescription>
              View all scheduled, ongoing, and completed test distributions.
              Monitor progress, review results, or extend time for active tests.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin/tests/distributions">
                View Scheduled Tests
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tests */}
      <Suspense fallback={<TestsListSkeleton />}>
        <TestsListLoader page={page} />
      </Suspense>
    </div>
  );
}
