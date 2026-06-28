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
import { BatchOption } from "../types/enrollments.types";

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
    [batches, value],
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Batch</label>

      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between truncate"
          >
            <span className="truncate">
              {selected ? selected.title : "Select batch"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder="Search batch or course..." />
            <CommandEmpty>No batch found.</CommandEmpty>

            <CommandGroup>
              {batches.map((batch) => {
                const courseTitles = batch.courses.map((c) => c.title);
                const primaryCourse = courseTitles[0];
                const extraCount = courseTitles.length - 1;

                return (
                  <CommandItem
                    key={batch.id}
                    value={`${batch.title} ${courseTitles.join(" ")}`}
                    onSelect={() => onChange(batch.id)}
                    className="cursor-pointer"
                  >
                    {/* Selection indicator */}
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full border",
                          batch.id === value
                            ? "bg-primary border-primary"
                            : "border-muted-foreground",
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 max-w-65">
                      {/* Batch name */}
                      <span className="truncate font-medium">
                        {batch.title}
                      </span>

                      {/* Course summary */}
                      <span className="truncate text-xs text-muted-foreground">
                        {primaryCourse
                          ? `${primaryCourse}${
                              extraCount > 0 ? ` +${extraCount} more` : ""
                            }`
                          : "No courses"}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
