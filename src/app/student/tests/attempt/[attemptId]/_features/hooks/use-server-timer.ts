"use client";

import { useEffect, useState } from "react";

function getSecondsLeft(expiresAt: string) {
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
}

export function useServerTimer(
    expiresAt: string,
    onExpire: () => void
) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        getSecondsLeft(expiresAt)
    );

    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const tick = () => {
            const diff = getSecondsLeft(expiresAt);
            setSecondsLeft(diff);

            if (diff <= 0 && !expired) {
                setExpired(true);
                onExpire();
            }
        };

        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiresAt, onExpire, expired]);

    return secondsLeft;
}
