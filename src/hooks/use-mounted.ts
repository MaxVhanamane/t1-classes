"use client";

import { useEffect, useState } from "react";

/**

* useMounted
* Returns true only after the component mounts on the client.
* Useful for preventing SSR hydration mismatches.
  */
export function useMounted(): boolean {
    const [mounted, setMounted] = useState(false);


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return mounted;
}
