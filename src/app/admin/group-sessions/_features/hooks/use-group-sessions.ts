"use client";

import { useQuery } from "@tanstack/react-query";

import { getGroupSessions } from "../api/group-sessions-api";
import { groupSessionsQueryKeys } from "../constants/query-keys";
import { GroupSessionFilters } from "../types/group-session-filters";

export function useGroupSessions(
    filters: GroupSessionFilters,
) {
    return useQuery({
        queryKey: groupSessionsQueryKeys.list(filters),

        queryFn: () => getGroupSessions(filters),

        placeholderData: (previousData) => previousData,

        staleTime: 1000 * 30,
    });
}
