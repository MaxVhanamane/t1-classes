"use client";

import { useMemo, useState } from "react";

import { ChevronsUpDown } from "lucide-react";

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

import { cn } from "@/src/lib/utils";

interface MentorshipBatchOption {
  id: string;

  title: string;
}

interface MentorshipBatchComboboxProps {
  batches: MentorshipBatchOption[];

  value?: string;

  onChange: (value: string) => void;

  disabled?: boolean;
  isLoading?: boolean;
}

export function MentorshipBatchCombobox({
  batches,

  value,

  onChange,

  disabled,
  isLoading,
}: MentorshipBatchComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => batches.find((batch) => batch.id === value),
    [batches, value],
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selected
                ? selected.title
                : isLoading
                  ? "Loading batches..."
                  : "Select batch"}
            </span>

            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
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
                  value={batch.title}
                  onSelect={() => {
                    onChange(batch.id);

                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border",
                        batch.id === value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground",
                      )}
                    />
                  </div>

                  <span className="truncate font-medium">{batch.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
