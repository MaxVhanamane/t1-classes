/* =========================================================
   Attempt Expiry Utility
   ---------------------------------------------------------
   Computes final expiry timestamp for an attempt by
   clamping attempt timer with distribution window.
========================================================= */

export type AttemptExpiryInput = {
    started_at: string;
    time_limit_seconds: number;
};

export type DistributionWindowInput = {
    ends_at: string;
};

/* --------------------------------------------------------
   Core Expiry Calculator
-------------------------------------------------------- */

export function getAttemptExpiryMs(
    attempt: AttemptExpiryInput,
    distribution: DistributionWindowInput
): number {
    const attemptStartMs = new Date(
        attempt.started_at
    ).getTime();

    const attemptExpiryMs =
        attemptStartMs +
        attempt.time_limit_seconds * 1000;

    const distributionEndMs = new Date(
        distribution.ends_at
    ).getTime();

    /* Clamp to earlier deadline */
    return Math.min(
        attemptExpiryMs,
        distributionEndMs
    );
}


/* --------------------------------------------------------
   Expiry Checker
-------------------------------------------------------- */

export function isAttemptExpired(
    expiryMs: number,
    nowMs: number = Date.now()
): boolean {
    return nowMs >= expiryMs;
}



/* =========================================================
   Attempt Expiry With Grace Utility
   ---------------------------------------------------------
   Mirrors RPC submission window logic.
========================================================= */

export function getAttemptExpiryWithGraceMs(
    attempt: AttemptExpiryInput,
    distribution: DistributionWindowInput,
    graceSeconds: number
): number {
    const attemptStartMs = new Date(
        attempt.started_at
    ).getTime();

    const attemptExpiryMs =
        attemptStartMs +
        attempt.time_limit_seconds * 1000 +
        graceSeconds * 1000;

    const distributionExpiryMs =
        new Date(distribution.ends_at).getTime() +
        graceSeconds * 1000;

    /* Clamp with grace on both windows */
    return Math.min(
        attemptExpiryMs,
        distributionExpiryMs
    );
}
