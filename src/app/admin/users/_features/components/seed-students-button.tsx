"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { seed30Students } from "@/src/app/student/tests/instructions/[distributionId]/_features/server-only/create-30-users";
import { toast } from "sonner";

export function SeedStudentsButton() {
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      try {
        await seed30Students();
        // You can add a toast notification here on success
      } catch (error) {
        toast.error("error seeding students");
        console.error("Failed to seed students:", error);
      }
    });
  };

  return (
    <Button onClick={handleSeed} disabled={isPending} variant="default">
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPending ? "Seeding Users..." : "Seed Students 51-80"}
    </Button>
  );
}
