"use client";

import { useQuery } from "@tanstack/react-query";
import type {
    ResultSummaryResponse,
} from "@/src/app/api/tests/results/[attemptId]/summary/route";
import { ApiError } from "@/src/lib/helper-functions/api-error-class";

/* ---------------------------------- */
/* Fetcher */
/* ---------------------------------- */

async function fetchResultSummary(
    attemptId: string
): Promise<ResultSummaryResponse> {
    const res = await fetch(
        `/api/tests/results/${attemptId}/summary`,
        {
            credentials: "include",
        }
    );

    let data: unknown;

    // -----------------------------------------
    // 1 Safe JSON parse
    // -----------------------------------------
    try {
        data = await res.json();
    } catch {
        throw new ApiError<null>(
            "Invalid JSON response from server",
            res.status,
            null
        );
    }

    // -----------------------------------------
    // 2 Handle non-OK responses
    // -----------------------------------------
    if (!res.ok) {
        let reason = "Request failed";

        if (
            typeof data === "object" &&
            data !== null &&
            "reason" in data &&
            typeof (data as { reason?: unknown }).reason ===
            "string"
        ) {
            reason = (data as { reason: string }).reason;
        }

        throw new ApiError<typeof data>(
            reason,
            res.status,
            data
        );
    }

    // -----------------------------------------
    // 3 Success return
    // -----------------------------------------
    return data as ResultSummaryResponse;
}


/* ---------------------------------- */
/* Hook */
/* ---------------------------------- */

export function useResultSummary(attemptId: string) {
    return useQuery({
        queryKey: ["result-summary", attemptId],
        queryFn: () => fetchResultSummary(attemptId),

        /* Result data almost never changes */
        staleTime: Infinity,
        gcTime: Infinity,

        /* Avoid firing without id */
        enabled: !!attemptId,
        refetchOnWindowFocus: false,
        refetchOnMount: "always"
    });
}
