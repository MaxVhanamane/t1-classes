export class HttpError extends Error {
    status: number;
    body?: unknown;

    constructor(status: number, body?: unknown) {
        super(`HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}

export async function fetchWrapper<T>(
    input: RequestInfo,
    init?: RequestInit
): Promise<T> {
    const res = await fetch(input, init);

    if (!res.ok) {
        let body: unknown = null;

        try {
            body = await res.json();
        } catch {
            // ignore non-json bodies
        }

        throw new HttpError(res.status, body);
    }

    return res.json();
}
