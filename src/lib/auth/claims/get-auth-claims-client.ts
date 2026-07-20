import { createBrowserSupabaseClient } from "../../supabase/supabase-client";

import {
    AuthContext,
    UserRole,
    UserStatus,
} from "../types/auth.types";

// -----------------------------------------------------------------------------
// Shared in-flight promise
// Prevents multiple simultaneous auth requests
// -----------------------------------------------------------------------------

let authPromise: Promise<AuthContext | null> | null = null;

// -----------------------------------------------------------------------------
// Error helpers
// -----------------------------------------------------------------------------

function getErrorDetails(error: unknown) {
    if (typeof error !== "object" || error === null) {
        return {
            message: "",
            code: "",
            name: "",
        };
    }

    const err = error as {
        message?: unknown;
        cause?: {
            code?: unknown;
            name?: unknown;
        };
    };

    return {
        message:
            typeof err.message === "string"
                ? err.message
                : "",

        code:
            typeof err.cause?.code === "string"
                ? err.cause.code
                : "",

        name:
            typeof err.cause?.name === "string"
                ? err.cause.name
                : "",
    };
}

function isRetryableError(error: unknown): boolean {
    const { message, code, name } =
        getErrorDetails(error);

    // Network timeout
    if (
        code === "UND_ERR_CONNECT_TIMEOUT" ||
        name === "ConnectTimeoutError"
    ) {
        return true;
    }

    // Temporary network fetch failure
    if (
        message.includes("fetch failed") &&
        !message.includes("ENOTFOUND")
    ) {
        return true;
    }

    return false;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) =>
        setTimeout(resolve, ms),
    );
}

async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error("Auth timeout"),
                );
            }, timeoutMs);
        }),
    ]);
}

// -----------------------------------------------------------------------------
// Main auth function
// -----------------------------------------------------------------------------

async function fetchAuth(): Promise<AuthContext | null> {
    const supabase =
        createBrowserSupabaseClient();

    const MAX_RETRIES = 1;

    for (
        let attempt = 0;
        attempt <= MAX_RETRIES;
        attempt++
    ) {
        try {
            const { data, error } =
                await withTimeout(
                    supabase.auth.getClaims(),
                    8000,
                );

            // Supabase responded successfully
            if (error || !data?.claims) {
                return null;
            }

            const claims = data.claims;

            return {
                userId: claims.sub,
                email: claims.email!,
                role: claims.app_role as UserRole,
                status:
                    claims.app_status as UserStatus,
            };
        } catch (error: unknown) {
            const retryable =
                isRetryableError(error);

            // Retry only once for temporary network failures
            if (
                retryable &&
                attempt < MAX_RETRIES
            ) {
                await sleep(400);

                continue;
            }

            // const {
            //     code,
            //     name,
            //     message,
            // } = getErrorDetails(error);

            // console.error(
            //     "getAuthClient failed:",
            //     {
            //         code,
            //         name,
            //         message,
            //     },
            // );

            return null;
        }
    }

    return null;
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export async function getAuthClaimsClient(): Promise<AuthContext | null> {
    // Reuse ongoing request
    if (authPromise) {
        return authPromise;
    }

    authPromise = fetchAuth().finally(() => {
        authPromise = null;
    });

    return authPromise;
}
