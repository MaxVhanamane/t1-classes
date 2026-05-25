"use client";

import { useQuery } from "@tanstack/react-query";

import { getGroupSessions } from "../api/group-sessions-api";

import { groupSessionsQueryKeys } from "../constants/query-keys";

interface UseGroupSessionsProps {
    page: number;

    limit: number;

    search: string;
}

export function useGroupSessions({
    page,
    limit,
    search,
}: UseGroupSessionsProps) {
    return useQuery({
        queryKey:
            groupSessionsQueryKeys.list(
                page,
                limit,
                search,
            ),

        queryFn: () =>
            getGroupSessions({
                page,
                limit,
                search,
            }),

        placeholderData: (
            previousData,
        ) => previousData,

        staleTime: 1000 * 30,
    });
}
