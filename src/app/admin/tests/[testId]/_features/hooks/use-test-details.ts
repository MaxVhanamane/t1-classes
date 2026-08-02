"use client";

import { useQuery } from "@tanstack/react-query";

import type { TestBuilderDetailsResponse } from "../types/test-builder.types";

export function useTestDetails(testId: string) {
    return useQuery({
        queryKey: ["admin", "tests", testId, "details"],

        queryFn: async (): Promise<TestBuilderDetailsResponse> => {
            const response = await fetch(
                `/api/admin/tests/${testId}/details`,
            );

            if (!response.ok) {
                const error = (await response.json().catch(() => null)) as
                    | { message?: string }
                    | null;

                throw new Error(
                    error?.message ?? "Failed to load test details",
                );
            }

            return response.json() as Promise<TestBuilderDetailsResponse>;
        },

        enabled: !!testId,
    });
}
