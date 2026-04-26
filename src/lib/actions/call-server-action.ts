
import { ServerActionResponse } from "@/src/types/server-action";

export type NormalizedActionResult<T = void> = {
    data: T | null;
    error: string | null;
};

export async function callServerAction<T>(
    action: Promise<ServerActionResponse<T>>
): Promise<NormalizedActionResult<T>> {
    const result = await action;

    if (!result) {
        return { data: null, error: null };
    }

    if ("error" in result) {
        return { data: null, error: result.error };
    }

    if ("data" in result) {
        return { data: result.data, error: null };
    }

    return { data: null, error: null };
}
