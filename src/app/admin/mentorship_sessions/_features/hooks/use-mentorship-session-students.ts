"use client";

import { useQuery } from "@tanstack/react-query";

import { getMentorshipSessionStudents } from "../api/mentorship-api";

import { mentorshipQueryKeys } from "../constants/query-keys";

interface UseMentorshipSessionStudentsProps {
    sessionId?: string;

    enabled?: boolean;
}

export function useMentorshipSessionStudents({
    sessionId,

    enabled = true,
}: UseMentorshipSessionStudentsProps) {
    return useQuery({
        queryKey:
            mentorshipQueryKeys.students(
                sessionId ?? "",
            ),

        queryFn: () =>
            getMentorshipSessionStudents(
                sessionId!,
            ),

        enabled:
            enabled &&
            !!sessionId,

        staleTime:
            1000 * 60 * 5,
    });
}
