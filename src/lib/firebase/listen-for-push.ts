import { onMessage } from "firebase/messaging";

import { getFirebaseMessaging } from "./client";

export async function startPushListener(
    onPush: (data: Record<string, string>) => void
): Promise<() => void> {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        onPush(payload.data ?? {});
    });
}
