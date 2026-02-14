"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { optimisticUpdateGrid } from "../helpers/grid-optimistic"
import { GridItem } from "../types/grid.types"

export function useQuestionVisit({
    attemptId,
    questionId,
}: {
    attemptId: string
    questionId?: string
}) {
    const visitedSet = useRef(new Set<string>())
    const queryClient = useQueryClient()

    const visitMutation = useMutation({
        mutationKey: ["visit", attemptId],

        mutationFn: async (qid: string) => {
            const res = await fetch(
                `/api/tests/attempts/${attemptId}/visit`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ questionId: qid }),
                }
            )

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg || "Visit failed")
            }
        },

        //  OPTIMISTIC: instantly turn yellow
        onMutate: async (qid) => {
            await queryClient.cancelQueries({
                queryKey: ["grid", attemptId],
            })

            const previousGrid =
                queryClient.getQueryData<GridItem[]>([
                    "grid",
                    attemptId,
                ])

            if (!Array.isArray(previousGrid)) {
                return { previousGrid: undefined }
            }

            const nextGrid = optimisticUpdateGrid(
                previousGrid,
                qid,
                "not_answered"
            )

            queryClient.setQueryData(
                ["grid", attemptId],
                nextGrid
            )

            return { previousGrid }
        },

        onError: (_err, _qid, ctx) => {
            if (ctx?.previousGrid) {
                queryClient.setQueryData(
                    ["grid", attemptId],
                    ctx.previousGrid
                )
            }

            console.warn("Visit telemetry failed")
        },

        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: ["grid", attemptId],
            })
        },
    })

    useEffect(() => {
        if (!questionId) return
        if (visitedSet.current.has(questionId)) return

        visitedSet.current.add(questionId)
        visitMutation.mutate(questionId)
    }, [questionId, visitMutation])
}
