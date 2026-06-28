"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";

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
import type { InstructorSelectItem } from "../types/types";

type Props = {
  value: string[];

  onChange: (value: string[]) => void;

  instructors: InstructorSelectItem[];

  isLoading: boolean;

  disabled?: boolean;
};

export function InstructorMultiSelectCombobox({
  value,
  onChange,
  instructors,
  isLoading,
  disabled,
}: Props) {
  const selectedInstructors = instructors.filter((instructor) =>
    value.includes(instructor.id),
  );

  const label = isLoading
    ? "Loading instructors..."
    : value.length === 0
      ? "Select instructors"
      : value.length === 1
        ? (selectedInstructors[0]?.full_name ?? "1 instructor selected")
        : `${value.length} instructors selected`;

  return (
    <div className="space-y-2">
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled || isLoading}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">{label}</span>

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

              <CommandGroup className="max-h-64 overflow-auto">
                {!isLoading &&
                  instructors.map((instructor) => {
                    const checked = value.includes(instructor.id);

                    return (
                      <CommandItem
                        key={instructor.id}
                        value={instructor.full_name}
                        onSelect={() => {
                          if (disabled) {
                            return;
                          }

                          if (checked) {
                            onChange(
                              value.filter((id) => id !== instructor.id),
                            );
                          } else {
                            onChange([...value, instructor.id]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          className="mr-2"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <span className="flex-1">{instructor.full_name}</span>

                        <Check
                          className={cn(
                            "ml-2 size-4",
                            checked ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedInstructors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedInstructors.map((instructor) => (
            <Badge
              key={instructor.id}
              variant="secondary"
              className="cursor-pointer rounded-sm"
              onClick={() => {
                if (disabled) {
                  return;
                }

                onChange(value.filter((id) => id !== instructor.id));
              }}
            >
              {instructor.full_name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
