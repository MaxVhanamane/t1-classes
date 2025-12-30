"use client";

import { useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { BatchOption } from "../types/enrollments";

type BatchComboboxProps = {
  batches: BatchOption[];
  value?: string;
  onChange: (id: string) => void;
};

export function BatchCombobox({
  batches,
  value,
  onChange,
}: BatchComboboxProps) {
  const selected = useMemo(
    () => batches.find((b) => b.id === value),
    [batches, value]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Batch</label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between truncate"
          >
            <span className="truncate">
              {selected ? selected.name : "Select batch"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder="Search batch..." />
            <CommandEmpty>No batch found.</CommandEmpty>

            <CommandGroup>
              {batches.map((batch) => (
                <CommandItem
                  key={batch.id}
                  value={`${batch.name} ${batch.course?.[0]?.title ?? ""}`}
                  onSelect={() => onChange(batch.id)}
                >
                  {/* Selection indicator */}
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border",
                        batch.id === value
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-0.5 max-w-65">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{batch.name}</span>
                    </div>

                    <p className="truncate text-xs text-muted-foreground">
                      {batch.course?.[0]?.title ?? "Unknown course"}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
