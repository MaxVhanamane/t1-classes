"use client";

import { useQuery } from "@tanstack/react-query";

import { getMentorshipSessions } from "../api/mentorship-api";

import { mentorshipQueryKeys } from "../constants/query-keys";

import type { MentorshipSessionFilters } from "../types/mentorship-filters";

export function useMentorshipSessions(
    filters: MentorshipSessionFilters,
) {
    return useQuery({
        queryKey: mentorshipQueryKeys.list(filters),

        queryFn: () => getMentorshipSessions(filters),

        placeholderData: (previousData) => previousData,

        staleTime: 1000 * 30,
    });
}
