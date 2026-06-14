"use client";

import { useQuery } from "@tanstack/react-query";

import type { TestFilters } from "../types/test-filters";
import type { TestListResponse } from "../types/test.types";

async function fetchTests(filters: TestFilters): Promise<TestListResponse> {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.createdBy) {
    searchParams.set("createdBy", filters.createdBy);
  }

  if (filters.testType) {
    searchParams.set("testType", filters.testType);
  }

  searchParams.set("locked", filters.locked);

  searchParams.set("page", String(filters.page));

  const response = await fetch(`/api/admin/tests?${searchParams.toString()}`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Failed to load tests");
  }

  return data;
}

export function useTests(filters: TestFilters) {
  return useQuery({
    queryKey: ["admin", "tests", filters],

    queryFn: () => fetchTests(filters),

    placeholderData:
      filters.page > 1 ? (previousData) => previousData : undefined,

    staleTime: 1000 * 60,

    gcTime: 1000 * 60 * 30,
  });
}
