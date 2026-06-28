"use client";

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
import { InstructorSelectItem } from "../../types/types";

type Props = {
  value: string | null;

  instructors: InstructorSelectItem[];

  onChange: (value: string | null) => void;

  isLoading: boolean;
};

export function InstructorFilterCombobox({
  value,
  instructors,
  onChange,
  isLoading,
}: Props) {
  const selected = instructors.find((instructor) => instructor.id === value);

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading instructors..."
            : (selected?.full_name ?? "All Instructors")}

          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className=" p-0" align="start">
        <Command>
          <CommandInput placeholder="Search instructors..." />

          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading instructors..." : "No instructors found."}
            </CommandEmpty>

            <CommandGroup>
              <CommandItem value="__all__" onSelect={() => onChange(null)}>
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === null ? "opacity-100" : "opacity-0",
                  )}
                />
                All Instructors
              </CommandItem>

              {!isLoading &&
                instructors.map((instructor) => (
                  <CommandItem
                    key={instructor.id}
                    value={instructor.full_name}
                    onSelect={() => onChange(instructor.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === instructor.id ? "opacity-100" : "opacity-0",
                      )}
                    />

                    {instructor.full_name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
