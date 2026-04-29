"use client";

import { useQuery } from "@tanstack/react-query";
import { getLiveClasses } from "../actions/get-live-classes";

export function useLiveClasses(page: number, limit: number) {
    return useQuery({
        queryKey: ["live-classes", page, limit],
        queryFn: () => getLiveClasses({ page, limit }),
        placeholderData: (prev) => prev,
    });
}
