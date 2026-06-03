"use client";

import { useState } from "react";

import { useUsers } from "../hooks/use-users";

import UsersToolbar from "./users-toolbar";

import UsersTable from "./users-table";

import UsersPagination from "./users-pagination";

import UserDialog from "./user-dialog";

import { Button } from "@/src/components/ui/button";

export default function UsersPageClient() {
  /* ---------- Pagination ---------- */

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  /* ---------- Search ---------- */

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  /* ---------- Filters ---------- */

  const [role, setRole] = useState("");

  const [status, setStatus] = useState("");

  /* ---------- Query ---------- */

  const { data, isLoading, isFetching, error } = useUsers({
    page,
    limit,
    search,
    role,
    status,
  });

  /* ---------- Actions ---------- */

  const handleSearch = () => {
    setPage(1);

    setSearch(searchInput.trim());
  };

  const handleReset = () => {
    setPage(1);

    setSearchInput("");

    setSearch("");

    setRole("");

    setStatus("");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ---------- Header ---------- */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>

          <p className="text-sm text-muted-foreground">
            Manage students, teachers, and admins
          </p>
        </div>

        <UserDialog mode="create">
          <Button>Create User</Button>
        </UserDialog>
      </div>

      {/* ---------- Toolbar ---------- */}

      <UsersToolbar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* ---------- Table ---------- */}

      <UsersTable
        users={data?.data ?? []}
        loading={isLoading}
        fetching={isFetching}
      />

      {/* ---------- Error ---------- */}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load users
        </div>
      )}

      {/* ---------- Pagination ---------- */}

      <UsersPagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.totalCount ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
