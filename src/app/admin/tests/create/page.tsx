import BackButtonClient from "../[testId]/_features/components/back-button-client";
import { CreateTestForm } from "./_features/components/create-test-form";

export default function CreateTestPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <BackButtonClient />
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">Create test</h1>
        <p className="text-sm text-muted-foreground">
          Start by choosing the test structure
        </p>
      </header>

      <CreateTestForm />
    </div>
  );
}
