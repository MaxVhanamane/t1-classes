/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
    CacheFirst,
    NetworkOnly,
    Serwist,
    StaleWhileRevalidate,
} from "serwist";

import { initializeApp } from "firebase/app";
import {
    getMessaging,
    onBackgroundMessage,
} from "firebase/messaging/sw";

import { firebaseConfig } from "../lib/firebase/firebase-config";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

// Initialize Firebase Messaging inside the service worker.
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// Handle background data messages.
// Since we're sending data-only payloads, we are responsible for
// displaying the notification ourselves.
onBackgroundMessage(messaging, async (payload) => {
    const data = payload.data ?? {};

    await self.registration.showNotification(
        data.title ?? "Notification",
        {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag || undefined,
            renotify: true,
            vibrate: data.vibrate
                ? JSON.parse(data.vibrate)
                : undefined,
            data,
        } as NotificationOptions
    );
});

// Handle notification clicks.
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        (async () => {
            const windows =
                await self.clients.matchAll({
                    type: "window",
                    includeUncontrolled: true,
                });

            // Find one of our application's tabs.
            const appClient = windows.find((client) =>
                client.url.startsWith(self.location.origin)
            );

            if (appClient) {
                appClient.postMessage({
                    type: "notification-clicked",
                    data: event.notification.data,
                });

                await appClient.focus();

                return;
            }

            // No app window exists; open the dashboard.
            await self.clients.openWindow(
                event.notification.data?.link ??
                "/student/dashboard"
            );
        })()
    );
});

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ request }) =>
                request.destination === "script" ||
                request.destination === "style",
            handler: new StaleWhileRevalidate(),
        },
        {
            matcher: ({ request }) =>
                request.destination === "image",
            handler: new CacheFirst(),
        },
        {
            matcher: ({ request }) =>
                request.destination === "font",
            handler: new CacheFirst(),
        },
        {
            // important: do NOT cache navigation
            matcher: ({ request }) =>
                request.mode === "navigate",
            handler: new NetworkOnly(),
        },
    ],
    fallbacks: {
        entries: [
            {
                url: "/~offline",
                matcher({ request }) {
                    return (
                        request.destination ===
                        "document"
                    );
                },
            },
        ],
    },
});

serwist.addEventListeners();
