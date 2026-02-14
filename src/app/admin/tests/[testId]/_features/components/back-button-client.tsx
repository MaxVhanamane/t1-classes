"use client";

import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

function BackButtonClient() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="px-0 text-muted-foreground w-fit"
      onClick={() => router.push(`/admin/tests`)}
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back to Test
    </Button>
  );
}

export default BackButtonClient;
