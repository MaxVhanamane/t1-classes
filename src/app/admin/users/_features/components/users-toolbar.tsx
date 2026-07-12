"use client";

import { Search } from "lucide-react";

import { Input } from "@/src/components/ui/input";

import { Button } from "@/src/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { userRoles, userStatuses } from "../zod/user-schema";

type Props = {
  searchInput: string;

  onSearchInputChange: (value: string) => void;

  role: string;

  onRoleChange: (value: string) => void;

  status: string;

  onStatusChange: (value: string) => void;

  onSearch: () => void;

  onReset: () => void;
};

export default function UsersToolbar({
  searchInput,
  onSearchInputChange,

  role,
  onRoleChange,

  status,
  onStatusChange,

  onSearch,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center">
      {/* Search */}

      <div className="flex flex-1 gap-2">
        <Input
          placeholder="Search by name, email or phone"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
        />

        <Button onClick={onSearch} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Role */}

      <Select
        value={role || "all"}
        onValueChange={(value) => onRoleChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>

          {userRoles.map((roleOption) => (
            <SelectItem key={roleOption} value={roleOption}>
              {roleOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}

      <Select
        value={status || "all"}
        onValueChange={(value) => onStatusChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>

          {userStatuses.map((statusOption) => (
            <SelectItem key={statusOption} value={statusOption}>
              {statusOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}

      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
