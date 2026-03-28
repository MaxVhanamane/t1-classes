"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import { UserSearchResult } from "@/src/types/user";
import { useDebounce } from "@/src/hooks/use-debounce";
import { searchUsers } from "@/src/lib/actions/search-users";

type UserSearchComboboxProps = {
  value?: string;
  selectedUser?: UserSearchResult | null;
  onChange: (id: string) => void;
};

export function UserSearchCombobox({
  value,
  selectedUser,
  onChange,
}: UserSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [pickedUser, setPickedUser] = useState<UserSearchResult | null>(null);

  const [isPending, startTransition] = useTransition();

  /** Fetch users (only when searching) */
  useEffect(() => {
    if (!debouncedQuery) return;

    startTransition(async () => {
      try {
        const data = await searchUsers(debouncedQuery);
        setResults(data);
      } catch {
        setResults([]);
      }
    });
  }, [debouncedQuery]);

  /** Derive what user should be displayed */
  const displayUser = useMemo(() => {
    if (selectedUser && selectedUser.id === value) return selectedUser;
    if (pickedUser && pickedUser.id === value) return pickedUser;
    return null;
  }, [selectedUser, pickedUser, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between truncate"
        >
          <span className="truncate">
            {displayUser ? displayUser.full_name : "Select user"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search student..."
            value={query}
            onValueChange={setQuery}
          />

          <CommandEmpty>
            {isPending ? "Searching..." : "No users found."}
          </CommandEmpty>

          <CommandGroup>
            {results.map((user) => (
              <CommandItem
                key={user.id}
                value={user.full_name}
                onSelect={() => {
                  setPickedUser(user); // local cache
                  onChange(user.id);
                  setOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                className="cursor-pointer"
              >
                <div className="mr-2 flex h-4 w-4 items-center justify-center">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border",
                      user.id === value
                        ? "bg-primary border-primary"
                        : "border-muted-foreground",
                    )}
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-medium truncate">{user.full_name}</span>
                  {user.phone && (
                    <span className="text-xs text-muted-foreground">
                      {user.phone}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
