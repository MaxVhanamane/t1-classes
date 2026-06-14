"use client";

import { useQuery } from "@tanstack/react-query";

import type { TestBuilderTest } from "../types/test-builder.types";
import type { TestSection } from "../types/test-section.types";

type TestDetailsResponse = {
    test: TestBuilderTest;

    sections: TestSection[];
};

export function useTestDetails(testId: string) {
    return useQuery({
        queryKey: ["admin", "tests", testId, "details"],

        queryFn: async (): Promise<TestDetailsResponse> => {
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

            return response.json() as Promise<TestDetailsResponse>;
        },

        enabled: !!testId,
    });
}
