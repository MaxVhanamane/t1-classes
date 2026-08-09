import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { PaginatedBatchStudents } from "../types/student-progress.types";

export function useBatchStudents(batchId: string | null, page: number, search: string) {
    return useQuery({
        queryKey: ["batch-students", batchId, page, search],
        queryFn: async () => {
            const url = new URL(`/api/admin/batches/${batchId}/students`, window.location.origin);
            url.searchParams.set("page", page.toString());
            if (search) {
                url.searchParams.set("search", search);
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed to fetch batch students");

            return res.json() as Promise<PaginatedBatchStudents>;
        },
        enabled: !!batchId,
        placeholderData: keepPreviousData, // Smooth UI transitions
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
