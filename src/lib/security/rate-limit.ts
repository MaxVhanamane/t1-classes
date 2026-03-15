
type RateLimitOptions = {
    limit: number;        // max requests
    windowMs: number;     // time window
};

type Entry = {
    count: number;
    expiresAt: number;
};

const store = new Map<string, Entry>();

export async function rateLimit(
    req: Request,
    { limit, windowMs }: RateLimitOptions,
) {
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        "unknown";

    const now = Date.now();
    const key = `rate:${ip}`;

    const existing = store.get(key);

    if (!existing || existing.expiresAt < now) {
        store.set(key, {
            count: 1,
            expiresAt: now + windowMs,
        });
        return { success: true };
    }

    if (existing.count >= limit) {
        return { success: false };
    }

    existing.count += 1;
    store.set(key, existing);

    return { success: true };
}
