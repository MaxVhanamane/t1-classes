import { FieldErrors } from "react-hook-form";

export function extractFirstErrorMessage(errors: FieldErrors): string | null {
    for (const key in errors) {
        const value = errors[key];

        if (!value) continue;

        // Base case: we found the message
        if ("message" in value && typeof value.message === "string") {
            return value.message;
        }

        // Recursive case: it's a nested object (like an array of fields or nested object)
        if (typeof value === "object") {
            const nested = extractFirstErrorMessage(value as FieldErrors);
            if (nested) return nested;
        }
    }

    return null;
}
