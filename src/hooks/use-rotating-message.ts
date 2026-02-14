"use client";

import { useEffect, useState } from "react";

export function useRotatingMessage(
    messages: string[],
    interval = 2200
) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!messages.length) return;

        if (index === messages.length - 1) return; // stop at end

        const id = setInterval(() => {
            setIndex((i) => {
                if (i >= messages.length - 1) {
                    clearInterval(id);
                    return i;
                }
                return i + 1;
            });
        }, interval);

        return () => clearInterval(id);
    }, [messages, interval, index]);

    return messages[index];
}
