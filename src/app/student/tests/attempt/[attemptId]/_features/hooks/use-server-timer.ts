"use client";

import { useEffect, useRef, useState } from "react";

function getSecondsLeft(expiresAt: string) {
    const expiry = new Date(expiresAt).getTime();

    return Math.max(
        0,
        Math.floor((expiry - Date.now()) / 1000)
    );
}

export function useServerTimer(
    expiresAt: string,
    onExpire: () => void
) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        getSecondsLeft(expiresAt)
    );

    const hasExpired = useRef(false);

    useEffect(() => {
        hasExpired.current = false;

        const tick = () => {
            const diff = getSecondsLeft(expiresAt);

            setSecondsLeft(diff);

            if (diff <= 0 && !hasExpired.current) {
                hasExpired.current = true;
                onExpire();
                return true;
            }

            return false;
        };

        if (tick()) {
            return;
        }

        const id = setInterval(() => {
            if (tick()) {
                clearInterval(id);
            }
        }, 1000);

        return () => clearInterval(id);
    }, [expiresAt, onExpire]);

    return secondsLeft;
}


// For testing
// "use client";

// import { useEffect, useRef, useState } from "react";

// const TEST_DURATION = 50;

// export function useServerTimer(
//     expiresAt: string,
//     onExpire: () => void
// ) {
//     void expiresAt;

//     const [secondsLeft, setSecondsLeft] =
//         useState(TEST_DURATION);

//     const hasExpired = useRef(false);

//     useEffect(() => {
//         const id = setInterval(() => {
//             setSecondsLeft(prev => {
//                 if (prev <= 1) {
//                     clearInterval(id);
//                     return 0;
//                 }

//                 return prev - 1;
//             });
//         }, 1000);

//         return () => clearInterval(id);
//     }, []);

//     useEffect(() => {
//         if (
//             secondsLeft === 0 &&
//             !hasExpired.current
//         ) {
//             hasExpired.current = true;
//             onExpire();
//         }
//     }, [secondsLeft, onExpire]);

//     return secondsLeft;
// }
