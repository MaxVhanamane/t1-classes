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
import type { CourseSelectItem } from "../types/types";

type Props = {
  value: string[];

  onChange: (value: string[]) => void;

  courses: CourseSelectItem[];

  isLoading: boolean;

  disabled?: boolean;
};

export function CourseMultiSelectCombobox({
  value,
  onChange,
  courses,
  isLoading,
  disabled,
}: Props) {
  const selectedCourses = courses.filter((course) => value.includes(course.id));

  const label = isLoading
    ? "Loading courses..."
    : value.length === 0
      ? "Select courses"
      : value.length === 1
        ? (selectedCourses[0]?.title ?? "1 course selected")
        : `${value.length} courses selected`;

  return (
    <div className="space-y-2">
      <Popover>
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
            <CommandInput placeholder="Search courses..." />

            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading courses..." : "No courses found."}
              </CommandEmpty>

              <CommandGroup className="max-h-64 overflow-auto">
                {!isLoading &&
                  courses.map((course) => {
                    const checked = value.includes(course.id);

                    return (
                      <CommandItem
                        key={course.id}
                        value={course.title}
                        onSelect={() => {
                          if (disabled) {
                            return;
                          }

                          if (checked) {
                            onChange(value.filter((id) => id !== course.id));
                          } else {
                            onChange([...value, course.id]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          className="mr-2"
                        />

                        <span className="flex-1">{course.title}</span>

                        {!course.is_active && (
                          <span className="text-xs text-muted-foreground">
                            Inactive
                          </span>
                        )}

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

      {selectedCourses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCourses.map((course) => (
            <Badge
              key={course.id}
              variant="secondary"
              className="cursor-pointer rounded-sm"
              onClick={() => {
                if (disabled) {
                  return;
                }

                onChange(value.filter((id) => id !== course.id));
              }}
            >
              {course.title}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
