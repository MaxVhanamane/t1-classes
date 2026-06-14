"use client";

import { useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { cn } from "@/src/lib/utils";

type BatchOption = {
  id: string;
  title: string;
};

type Props = {
  value: string | null;

  batches: Pick<BatchOption, "id" | "title">[];

  onChange: (value: string | null) => void;

  isLoading: boolean;

  disabled?: boolean;
};

export function BatchFilterCombobox({
  value,
  batches,
  onChange,
  isLoading,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = batches.find((batch) => batch.id === value);

  const isDisabled = isLoading || disabled;

  return (
    <Popover
      open={isDisabled ? false : open}
      onOpenChange={(nextOpen) => {
        if (!isDisabled) {
          setOpen(nextOpen);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={isDisabled}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {isLoading
              ? "Loading batches..."
              : (selected?.title ?? "All Batches")}
          </span>

          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search batches..." />

          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading batches..." : "No batches found."}
            </CommandEmpty>

            <CommandGroup>
              <CommandItem
                value="__all__"
                onSelect={() => {
                  onChange(null);

                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === null ? "opacity-100" : "opacity-0",
                  )}
                />
                All Batches
              </CommandItem>

              {!isLoading &&
                batches.map((batch) => (
                  <CommandItem
                    key={batch.id}
                    value={batch.title}
                    onSelect={() => {
                      onChange(batch.id);

                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === batch.id ? "opacity-100" : "opacity-0",
                      )}
                    />

                    {batch.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
