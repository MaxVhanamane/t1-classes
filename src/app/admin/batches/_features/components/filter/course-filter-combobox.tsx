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

import type { CourseSelectItem } from "../../types/types";

type Props = {
  value: string | null;

  courses: CourseSelectItem[];

  onChange: (value: string | null) => void;

  isLoading: boolean;

  disabled?: boolean;
};

export function CourseFilterCombobox({
  value,
  courses,
  onChange,
  isLoading,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = courses.find((course) => course.id === value);

  const isDisabled = isLoading || disabled;

  return (
    <Popover
      open={isDisabled ? false : open}
      onOpenChange={(nextOpen) => {
        if (!isDisabled) {
          setOpen(nextOpen);
        }
      }}
      modal={true}
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
              ? "Loading courses..."
              : (selected?.title ?? "All Courses")}
          </span>

          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search courses..." />

          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading courses..." : "No courses found."}
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
                All Courses
              </CommandItem>

              {!isLoading &&
                courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={course.title}
                    onSelect={() => {
                      onChange(course.id);

                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === course.id ? "opacity-100" : "opacity-0",
                      )}
                    />

                    {course.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
