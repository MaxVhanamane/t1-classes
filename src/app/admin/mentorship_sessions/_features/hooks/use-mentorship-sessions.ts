"use client";

import { useQuery } from "@tanstack/react-query";

import { getMentorshipSessions } from "../api/mentorship-api";

import { mentorshipQueryKeys } from "../constants/query-keys";

interface UseMentorshipSessionsProps {
    page: number;

    limit: number;

    search: string;
}

export function useMentorshipSessions({
    page,
    limit,
    search,
}: UseMentorshipSessionsProps) {
    return useQuery({
        queryKey:
            mentorshipQueryKeys.list(
                page,
                limit,
                search,
            ),

        queryFn: () =>
            getMentorshipSessions({
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
