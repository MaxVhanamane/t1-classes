"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export function BackButton() {
  const router = useRouter();

  // This runs only on client, not during SSR
  const [mounted] = useState(() => true);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="cursor-pointer group text-muted-foreground hover:text-foreground flex items-center gap-1 px-1"
      onClick={() => router.back()}
    >
      <ArrowLeft
        className="
      h-4 w-4
      transition-transform duration-200 ease-out
      group-hover:-translate-x-0.5
    "
      />
      <span className="text-sm leading-none">Back</span>
    </Button>
  );
}
