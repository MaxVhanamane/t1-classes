"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/src/lib/utils";

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
  CommandList,
} from "@/src/components/ui/command";

import { BatchRow } from "../types/batch.types";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  batches: BatchRow[];
  disabled?: boolean;
}

export function BatchMultiSelect({
  value,
  onChange,
  batches,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (value.length === 0) return "Select batches";
    if (value.length === 1) {
      return batches.find((b) => b.id === value[0])?.title ?? "1 selected";
    }

    return `${value.length} batches selected`;
  }, [value, batches]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }

    onChange([...value, id]);
  }

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className="w-full justify-between"
        >
          {label}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-95 p-0">
        <Command>
          <CommandInput placeholder="Search batches..." />

          <CommandList>
            <CommandEmpty>No batch found.</CommandEmpty>

            <CommandGroup>
              {batches.map((batch) => {
                const selected = value.includes(batch.id);

                return (
                  <CommandItem
                    key={batch.id}
                    value={batch.title}
                    onSelect={() => toggle(batch.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected ? "opacity-100" : "opacity-0",
                      )}
                    />

                    {batch.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
