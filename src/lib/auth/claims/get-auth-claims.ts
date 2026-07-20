import "server-only";
import { cache } from "react";

import { createServerSupabaseClient } from "../../supabase/supabase-server";

import {
    AuthContext,
    UserRole,
    UserStatus,
} from "../types/auth.types";

// -----------------------------------------------------------------------------
// Error helpers
// -----------------------------------------------------------------------------

function isTimeoutError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
        return false;
    }

    const err = error as {
        message?: unknown;
        cause?: {
            code?: unknown;
            name?: unknown;
        };
    };

    const code =
        typeof err.cause?.code === "string"
            ? err.cause.code
            : "";

    const name =
        typeof err.cause?.name === "string"
            ? err.cause.name
            : "";

    const message =
        typeof err.message === "string"
            ? err.message
            : "";

    return (
        code === "UND_ERR_CONNECT_TIMEOUT" ||
        name === "ConnectTimeoutError" ||
        message.includes("fetch failed")
    );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------------------------------------------------------------------------
// Main auth function
// -----------------------------------------------------------------------------

export const getAuthClaims = cache(
    async (): Promise<AuthContext | null> => {
        const supabase =
            await createServerSupabaseClient();

        const MAX_RETRIES = 2;

        for (
            let attempt = 0;
            attempt <= MAX_RETRIES;
            attempt++
        ) {
            try {
                const { data, error } =
                    await supabase.auth.getClaims();

                if (error || !data?.claims) {
                    return null;
                }

                const claims = data.claims;

                return {
                    userId: claims.sub,
                    email: claims.email!,
                    role: claims.app_role as UserRole,
                    status: claims.app_status as UserStatus,
                };
            } catch (error: unknown) {
                const timeout =
                    isTimeoutError(error);

                if (
                    timeout &&
                    attempt < MAX_RETRIES
                ) {
                    const delay =
                        300 *
                        Math.pow(2, attempt);

                    await sleep(delay);

                    continue;
                }

                console.error(
                    "getAuthClaims failed:",
                    error,
                );

                return null;
            }
        }

        return null;
    },
);
