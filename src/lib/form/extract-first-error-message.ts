import { FieldErrors } from "react-hook-form";

export function extractFirstErrorMessage(
    errors: FieldErrors,
): string | undefined {
    const first = Object.values(errors)[0];

    if (!first) return undefined;

    if (
        typeof first === "object" &&
        "message" in first &&
        typeof first.message === "string"
    ) {
        return first.message;
    }

    return "Please fix the form errors";
}
