"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsers } from "../api/get-users";

type UseUsersParams = {
    page: number;

    limit: number;

    search: string;

    role: string;

    status: string;
};

export function useUsers({
    page,
    limit,
    search,
    role,
    status,
}: UseUsersParams) {
    return useQuery({
        queryKey: [
            "users",
            page,
            limit,
            search,
            role,
            status,
        ],

        queryFn: () =>
            getUsers({
                page,
                limit,
                search,
                role,
                status,
            }),

        placeholderData: (
            previousData,
        ) => previousData,
    });
}
