"use client";

import { useState } from "react";

import { NotificationDialog } from "./notification-dialog";
import { NotificationsTable } from "./notifications-table";
import { useNotifications } from "../hooks/use-notifications";

import { DEFAULT_NOTIFICATION_FILTERS } from "../constants/notification-filters.constants";

import type { NotificationFilters } from "../types/notification-filters";
import { useActiveBatchOptions } from "@/src/hooks/use-active-batch-options";
import { NotificationFiltersBar } from "./filter/notification-filters-bar";
import { Pagination } from "@/src/components/ui/pagination/pagination";

export function NotificationsPageClient() {
  const [filters, setFilters] = useState<NotificationFilters>(
    DEFAULT_NOTIFICATION_FILTERS,
  );

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useNotifications(filters);

  const { data: batches = [], isLoading: isBatchesLoading } =
    useActiveBatchOptions();

  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <NotificationDialog />
      </div>

      <NotificationFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
        batches={batches}
        isBatchesLoading={isBatchesLoading}
      />

      <NotificationsTable
        notifications={data?.items ?? []}
        loading={isLoading}
      />

      <Pagination
        page={filters.page}
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.total ?? 0}
        pageSize={data?.pageSize ?? 10}
        onPageChange={(page) =>
          setFilters((prev) => ({
            ...prev,
            page,
          }))
        }
      />
    </div>
  );
}
