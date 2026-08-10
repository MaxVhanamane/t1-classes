"use client";

import { useState } from "react";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { TableSkeleton } from "@/src/components/ui/skeleton/table/table-skeleton";
import { ErrorStateCard } from "@/src/components/ui/common/error-state-card";
import { cn } from "@/src/lib/utils";

import { LeadFilterBar } from "./filter/lead-filter-bar";
import { useLeads } from "../hooks/use-leads";
import { DEFAULT_LEAD_FILTERS, LeadRow } from "../types/lead.types";
import { LeadsTable } from "./leads-table";
import { LeadUpdateDialog } from "./lead-update-dialog";

export function LeadsClient() {
  const [filters, setFilters] = useState(DEFAULT_LEAD_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useLeads(filters);

  if (error instanceof Error) {
    return (
      <ErrorStateCard message={error.message} onRetry={() => void refetch()} />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
      </div>

      <LeadFilterBar
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
      />

      {isLoading ? (
        <TableSkeleton rows={10} columns={7} showTableHeader />
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          No leads found matching your criteria.
        </div>
      ) : (
        <>
          <div className={cn(isFetching && "opacity-60")}>
            <LeadsTable
              leads={data.items}
              onEdit={(lead) => setSelectedLead(lead)}
            />
          </div>

          <div className="md:hidden rounded-md border p-4 text-center text-sm text-muted-foreground">
            Please view on a larger screen.
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.total}
            pageSize={data.pageSize}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </>
      )}

      <LeadUpdateDialog
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
}
