"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

import { ChevronsUpDown } from "lucide-react";
import type { InstructorOption } from "../types/course.types";

type Props = {
  value: string[];

  onChange: (value: string[]) => void;

  instructors: InstructorOption[];

  isLoading: boolean;
};

export function CourseInstructorsMultiSelect({
  value,
  onChange,
  instructors,
  isLoading,
}: Props) {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>Instructors</FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className="justify-between"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading instructors..."
                : value.length > 0
                  ? `${value.length} instructor(s) selected`
                  : "Select instructors"}

              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent className="w-75 p-0">
          <Command>
            <CommandInput placeholder="Search instructors..." />

            <CommandEmpty>
              {isLoading ? "Loading instructors..." : "No instructors found."}
            </CommandEmpty>

            <CommandGroup className="max-h-64 overflow-auto">
              {instructors.map((instructor) => {
                const isSelected = value.includes(instructor.id);

                return (
                  <CommandItem
                    key={instructor.id}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onChange([...value, instructor.id]);
                        } else {
                          onChange(value.filter((id) => id !== instructor.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <span>{instructor.full_name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {instructors
            .filter((instructor) => value.includes(instructor.id))
            .map((instructor) => (
              <Badge
                key={instructor.id}
                variant="secondary"
                className="cursor-pointer rounded-sm"
                onClick={() =>
                  onChange(value.filter((id) => id !== instructor.id))
                }
              >
                {instructor.full_name}
              </Badge>
            ))}
        </div>
      )}

      <FormMessage />
    </FormItem>
  );
}
