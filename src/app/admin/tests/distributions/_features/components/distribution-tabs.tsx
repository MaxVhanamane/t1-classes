"use client";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

const TABS = [
  { id: "scheduled", label: "Scheduled" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function DistributionTabs({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {TABS.map((tab) => (
        <Button
          variant="ghost"
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm transition",
            value === tab.id
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground",
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
