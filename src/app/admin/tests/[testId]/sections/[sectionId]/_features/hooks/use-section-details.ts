import { useQuery } from "@tanstack/react-query";

import type { TestSection } from "../types/section.types";

export function useSectionDetails(
  testId: string,
  sectionId: string,
) {
  return useQuery({
    queryKey: [
      "admin",
      "tests",
      testId,
      "sections",
      sectionId,
    ],

    queryFn: async (): Promise<TestSection> => {
      const response = await fetch(
        `/api/admin/tests/${testId}/sections/${sectionId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Failed to load section",
        );
      }

      return data as TestSection;
    },

    enabled: !!testId && !!sectionId,

    staleTime: 1000 * 60 * 30, // 30 minutes

    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
