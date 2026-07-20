"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthClaimsClient } from "../get-auth-claims-client";

export function useAuthClaims() {
    return useQuery({
        queryKey: ["auth", "claims"],
        queryFn: getAuthClaimsClient,
        staleTime: 60 * 1000,      // 1 minute
        gcTime: 5 * 60 * 1000,     // 5 minutes
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
