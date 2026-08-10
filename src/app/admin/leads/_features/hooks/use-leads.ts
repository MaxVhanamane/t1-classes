import { useQuery } from "@tanstack/react-query";
import type { LeadRow, LeadFilters } from "../types/lead.types";

type LeadsResponse = {
    items: LeadRow[];
    page: number;
    total: number;
    totalPages: number;
    pageSize: number;
};

async function fetchLeads(filters: LeadFilters): Promise<LeadsResponse> {
    const searchParams = new URLSearchParams();

    if (filters.search) searchParams.set("search", filters.search);
    searchParams.set("status", filters.status);
    searchParams.set("targetType", filters.targetType);
    searchParams.set("page", String(filters.page));

    const response = await fetch(`/api/admin/leads?${searchParams.toString()}`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? "Failed to load leads");
    }

    return data;
}

export function useLeads(filters: LeadFilters) {
    return useQuery({
        queryKey: ["admin", "leads", filters],
        queryFn: () => fetchLeads(filters),
        placeholderData: filters.page > 1 ? (prev) => prev : undefined,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 30,
    });
}
