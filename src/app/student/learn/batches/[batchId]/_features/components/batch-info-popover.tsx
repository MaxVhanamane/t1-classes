"use client";

import { Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

type Props = {
  start_date?: string | null;
  end_date?: string | null;
};

export function BatchInfoPopover({ start_date, end_date }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
        >
          <Info className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 space-y-3 bg-card">
        <div className="space-y-1 text-xs text-muted-foreground">
          {start_date && <p>Start date: {start_date}</p>}
          {end_date && <p>End date: {end_date}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
