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
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// -----------------------------------------------------------------------------
// Main auth function
// -----------------------------------------------------------------------------

export const getAuthVerified = cache(
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
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error || !user) {
                    return null;
                }

                const {
                    data: profile,
                    error: profileError,
                } = await supabase
                    .from("users")
                    .select("role, status")
                    .eq("id", user.id)
                    .single();

                if (profileError || !profile) {
                    console.error(
                        "Failed to load user profile:",
                        profileError,
                    );

                    return null;
                }

                return {
                    userId: user.id,
                    email: user.email!,
                    role: profile.role as UserRole,
                    status: profile.status as UserStatus,
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
                    "getVerifiedAuth failed:",
                    error,
                );

                return null;
            }
        }

        return null;
    },
);
