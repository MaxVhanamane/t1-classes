export const TEST_TIME_STORAGE_PREFIX =
    "test-time:";

export const TEST_TIME_STORAGE_TTL_MS =
    24 * 60 * 60 * 1000;

type QuestionTimeStorage = {
    pendingTimesMs: Record<string, number>;
    updatedAt: number;
};

export function cleanupTestTimeStorage() {
    try {
        const now = Date.now();

        Object.keys(localStorage).forEach((key) => {
            if (
                !key.startsWith(
                    TEST_TIME_STORAGE_PREFIX,
                )
            ) {
                return;
            }

            try {
                const raw =
                    localStorage.getItem(key);

                if (!raw) {
                    return;
                }

                const parsed =
                    JSON.parse(
                        raw,
                    ) as QuestionTimeStorage;

                if (
                    !parsed.updatedAt ||
                    now - parsed.updatedAt >
                    TEST_TIME_STORAGE_TTL_MS
                ) {
                    localStorage.removeItem(key);
                }
            } catch {
                localStorage.removeItem(key);
            }
        });
    } catch {
        // Ignore storage access errors
    }
}
