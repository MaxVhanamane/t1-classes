"use client";

import { FileText, CalendarDays, ClipboardList } from "lucide-react";

import { Link } from "@/src/components/ui/link";

import { Button } from "@/src/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import { Separator } from "@/src/components/ui/separator";

export function TestsHeader() {
  return (
    <>
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
                View Scheduled Tests & Results
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
