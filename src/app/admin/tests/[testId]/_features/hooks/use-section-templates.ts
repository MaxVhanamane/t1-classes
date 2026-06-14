"use client";

import { useQuery } from "@tanstack/react-query";

import type { SectionTemplate } from "../types/section-template.types";

export function useSectionTemplates(enabled = true) {
    return useQuery({
        queryKey: ["admin", "tests", "section-templates"],

        queryFn: async (): Promise<SectionTemplate[]> => {
            const response = await fetch(
                "/api/admin/tests/section-templates",
            );

            if (!response.ok) {
                const error = (await response.json().catch(() => null)) as
                    | { message?: string }
                    | null;

                throw new Error(
                    error?.message ??
                    "Failed to load section templates",
                );
            }

            return response.json() as Promise<
                SectionTemplate[]
            >;
        },

        enabled,

        // Templates rarely change
        staleTime: 1000 * 60 * 60, // 1 hour

        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
