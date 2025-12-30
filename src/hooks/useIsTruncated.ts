import { useLayoutEffect, useRef, useState } from "react";

export function useIsTruncated<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const check = () => {
            setIsTruncated(el.scrollHeight > el.clientHeight);
        };

        check();

        const ro = new ResizeObserver(check);
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    return { ref, isTruncated };
}
