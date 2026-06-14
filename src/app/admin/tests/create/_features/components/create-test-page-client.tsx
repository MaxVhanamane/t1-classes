"use client";

import { BackLink } from "@/src/components/ui/navigation/back-link";
import { CreateTestForm } from "./create-test-form";

export function CreateTestPageClient() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6 mb-10">
      <BackLink label="Back to Tests" href="/admin/tests" />

      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">Create test</h1>

        <p className="text-sm text-muted-foreground">
          Add basic details and choose the test type.
        </p>
      </header>

      <CreateTestForm />
    </div>
  );
}
