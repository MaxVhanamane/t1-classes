"use client";

import { useMemo, useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

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
import { toast } from "sonner";

interface MentorshipStudentOption {
  id: string;

  full_name: string;
}

interface MentorshipStudentsComboboxProps {
  students: MentorshipStudentOption[];

  value: string[];

  onChange: (value: string[]) => void;

  disabled?: boolean;

  batchId: string;
  maxSelectionCount?: number;
  maxSelectionMessage?: string;
}

export function MentorshipStudentsCombobox({
  students,
  value,
  onChange,
  batchId,
  disabled,
  maxSelectionCount,
  maxSelectionMessage,
}: MentorshipStudentsComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedStudents = useMemo(
    () => students.filter((student) => value.includes(student.id)),
    [students, value],
  );

  const toggleStudent = (studentId: string) => {
    if (value.includes(studentId)) {
      onChange(value.filter((id) => id !== studentId));

      return;
    }
    if (maxSelectionCount && value.length >= maxSelectionCount) {
      return;
    }

    onChange([...value, studentId]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selectedStudents.length > 0
              ? `${selectedStudents.length} selected`
              : !batchId
                ? "Select batch first"
                : disabled
                  ? "Loading students..."
                  : "Select students"}
          </span>

          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search students..." />

          <CommandEmpty>No students found.</CommandEmpty>

          <CommandGroup className="max-h-60 overflow-y-auto">
            {students.map((student) => {
              const selected = value.includes(student.id);

              const maxReached =
                !!maxSelectionCount &&
                value.length >= maxSelectionCount &&
                !selected;

              return (
                <CommandItem
                  key={student.id}
                  value={student.full_name}
                  onSelect={() => {
                    if (!maxReached) {
                      toggleStudent(student.id);
                    }

                    if (maxReached) {
                      toast.warning(
                        maxSelectionMessage ??
                          `Maximum ${maxSelectionCount} students are allowed.`,
                      );
                    }
                  }}
                  className={cn("cursor-pointer", maxReached && "opacity-50")}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />

                  <span className="truncate">{student.full_name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
