"use client";

import { TEST_TIME_STORAGE_PREFIX, TEST_TIME_STORAGE_TTL_MS } from "@/src/lib/test/cleanup-test-time-storage";
import {
    useCallback,
    useEffect,
    useRef,
} from "react";

type QuestionTimeStorage = {
    pendingTimesMs: Record<string, number>;
    updatedAt: number;
};


export function useQuestionTimeTracker(
    attemptId: string,
) {
    const storageKey =
        `${TEST_TIME_STORAGE_PREFIX}${attemptId}`;

    const currentQuestionRef =
        useRef<string | null>(null);

    const startedAtRef =
        useRef<number>(0);

    /**
     * Stores ONLY unsynced time since
     * the last successful save.
     */
    const pendingTimesMsRef = useRef<
        Record<string, number>
    >({});



    const persist = useCallback(() => {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                pendingTimesMs:
                    pendingTimesMsRef.current,
                updatedAt: Date.now(),
            }),
        );
    }, [storageKey]);

    useEffect(() => {
        try {
            const raw =
                localStorage.getItem(
                    storageKey,
                );

            if (!raw) return;

            const parsed =
                JSON.parse(
                    raw,
                ) as QuestionTimeStorage;
            if (
                !parsed.updatedAt ||
                Date.now() -
                parsed.updatedAt >
                TEST_TIME_STORAGE_TTL_MS
            ) {
                localStorage.removeItem(
                    storageKey,
                );
                return;
            }

            pendingTimesMsRef.current =
                parsed.pendingTimesMs ??
                {};
        } catch {
            localStorage.removeItem(
                storageKey,
            );
        }
    }, [storageKey]);

    const flushCurrentQuestion =
        useCallback(() => {
            const questionId =
                currentQuestionRef.current;

            if (
                !questionId ||
                startedAtRef.current === 0
            ) {
                return;
            }

            const elapsedMs =
                Date.now() -
                startedAtRef.current;

            if (elapsedMs <= 0) {
                return;
            }

            pendingTimesMsRef.current = {
                ...pendingTimesMsRef.current,
                [questionId]:
                    (
                        pendingTimesMsRef.current[
                        questionId
                        ] ?? 0
                    ) + elapsedMs,
            };

            persist();

            startedAtRef.current =
                Date.now();
        }, [persist]);

    const enterQuestion =
        useCallback(
            (questionId: string) => {
                if (
                    currentQuestionRef.current ===
                    questionId
                ) {
                    return;
                }

                flushCurrentQuestion();

                currentQuestionRef.current =
                    questionId;

                startedAtRef.current =
                    Date.now();
            },
            [flushCurrentQuestion],
        );

    // useEffect(() => {
    //     const id = setInterval(() => {
    //         const questionId =
    //             currentQuestionRef.current;

    //         if (
    //             !questionId ||
    //             startedAtRef.current === 0
    //         ) {
    //             return;
    //         }

    //         const baseMs =
    //             pendingTimesMsRef.current[
    //             questionId
    //             ] ?? 0;

    //         const liveMs =
    //             Date.now() -
    //             startedAtRef.current;

    //         setCurrentQuestionSeconds(
    //             Math.floor(
    //                 (baseMs + liveMs) /
    //                 1000,
    //             ),
    //         );
    //     }, 1000);

    //     return () =>
    //         clearInterval(id);
    // }, []);

    useEffect(() => {
        const saveCurrentTime = () => {
            flushCurrentQuestion();
        };

        const handleVisibility =
            () => {
                if (
                    document.visibilityState ===
                    "hidden"
                ) {
                    saveCurrentTime();
                }
            };

        document.addEventListener(
            "visibilitychange",
            handleVisibility,
        );

        window.addEventListener(
            "beforeunload",
            saveCurrentTime,
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibility,
            );

            window.removeEventListener(
                "beforeunload",
                saveCurrentTime,
            );
        };
    }, [flushCurrentQuestion]);

    /**
     * Returns ONLY unsynced time.
     */
    function getQuestionTime(
        questionId: string,
    ) {
        return Math.floor(
            (
                pendingTimesMsRef.current[
                questionId
                ] ?? 0
            ) / 1000,
        );
    }

    function getCurrentQuestionSeconds() {
        const questionId =
            currentQuestionRef.current;

        if (
            !questionId ||
            startedAtRef.current === 0
        ) {
            return 0;
        }

        const baseMs =
            pendingTimesMsRef.current[
            questionId
            ] ?? 0;

        const liveMs =
            Date.now() -
            startedAtRef.current;

        return Math.floor(
            (baseMs + liveMs) / 1000,
        );
    }

    /**
     * Returns all unsynced times.
     */
    function getPendingTimes() {
        return Object.fromEntries(
            Object.entries(
                pendingTimesMsRef.current,
            )
                .filter(
                    ([, ms]) => ms > 0,
                )
                .map(([id, ms]) => [
                    id,
                    Math.floor(ms / 1000),
                ]),
        );
    }



    /**
     * Question successfully saved.
     *
     * Reset ONLY the unsynced delta.
     * Server already accumulated it.
     */
    function markQuestionSynced(
        questionId: string,
    ) {
        const next = {
            ...pendingTimesMsRef.current,
        };

        delete next[questionId];

        pendingTimesMsRef.current = next;

        persist();
    }
    function clear() {
        pendingTimesMsRef.current = {};

        currentQuestionRef.current =
            null;

        startedAtRef.current = 0;


        localStorage.removeItem(
            storageKey,
        );
    }

    return {
        getCurrentQuestionSeconds,
        enterQuestion,
        flushCurrentQuestion,
        getQuestionTime,
        getPendingTimes,
        markQuestionSynced,
        clear,
    };
}

export type QuestionTimer =
    ReturnType<
        typeof useQuestionTimeTracker
    >;
