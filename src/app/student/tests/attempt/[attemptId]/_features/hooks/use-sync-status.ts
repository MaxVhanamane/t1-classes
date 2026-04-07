"use client"

import { useMutationState } from "@tanstack/react-query"

export type SyncStatus = {
    isIdle: boolean
    isSaving: boolean
    isRetrying: boolean
    isError: boolean
}

export function useSyncStatus(attemptId: string): SyncStatus {
    const mutations = useMutationState({
        filters: {
            mutationKey: ["answer", attemptId],
        },
    })

    if (mutations.length === 0) {
        return {
            isIdle: true,
            isSaving: false,
            isRetrying: false,
            isError: false,
        }
    }

    const latest = mutations[mutations.length - 1]

    return {
        isIdle: false,
        isSaving: latest.status === "pending",
        isRetrying:
            latest.status === "pending" &&
            (latest.failureCount ?? 0) > 0,
        isError: latest.status === "error",
    }
}
