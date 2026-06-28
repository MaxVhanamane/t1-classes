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
import { CourseOption } from "../types/enrollments.types";

type CourseComboboxProps = {
  courses: CourseOption[];
  value?: string;
  onChange: (id: string) => void;
};

export function CourseCombobox({
  courses,
  value,
  onChange,
}: CourseComboboxProps) {
  const selected = useMemo(
    () => courses.find((c) => c.id === value),
    [courses, value],
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Course</label>

      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between truncate"
          >
            <span className="truncate">
              {selected ? selected.title : "Select course"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder="Search course..." />
            <CommandEmpty>No course found.</CommandEmpty>

            <CommandGroup>
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={course.title}
                  onSelect={() => onChange(course.id)}
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border",
                        course.id === value
                          ? "bg-primary border-primary"
                          : "border-muted-foreground",
                      )}
                    />
                  </div>

                  <span className="truncate max-w-65">{course.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
