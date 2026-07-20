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

import type { InstructorOption } from "@/src/app/admin/courses/_features/types/course.types";

type Props = {
  value: string | "all" | "me";

  instructors: InstructorOption[];

  currentUserId: string;

  onChange: (value: string | "all" | "me") => void;

  isLoading: boolean;
};

export function CreatedByCombobox({
  value,
  instructors,
  currentUserId,
  onChange,
  isLoading,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected =
    value === "me"
      ? instructors.find((user) => user.id === currentUserId)
      : instructors.find((user) => user.id === value);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between font-normal w-fit"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading staff..."
            : value === "all"
              ? "All Staff"
              : value === "me"
                ? `Me${selected ? ` (${selected.full_name})` : ""}`
                : (selected?.full_name ?? "Select creator")}

          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search staff..." />

          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading staff..." : "No staff found."}
            </CommandEmpty>

            <CommandGroup>
              <CommandItem
                value="__me__"
                onSelect={() => {
                  onChange("me");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === "me" ? "opacity-100" : "opacity-0",
                  )}
                />
                Me
              </CommandItem>

              <CommandItem
                value="__all__"
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === "all" ? "opacity-100" : "opacity-0",
                  )}
                />
                All Staff
              </CommandItem>

              {!isLoading &&
                instructors.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.full_name}
                    onSelect={() => {
                      onChange(user.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === user.id ? "opacity-100" : "opacity-0",
                      )}
                    />

                    {user.full_name}

                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
