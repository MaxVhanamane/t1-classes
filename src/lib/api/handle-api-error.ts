import { HttpError } from "./fetch-wrapper";

export function handleApiError(error: unknown) {
    if (!(error instanceof HttpError)) return;

    if (error.status === 401) {
        window.location.replace("/login");
        return;
    }

    if (error.status === 403) {
        window.location.replace("/");
        return;
    }
}
