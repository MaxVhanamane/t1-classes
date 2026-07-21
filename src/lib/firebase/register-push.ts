import { onRegistered, register, type Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./client";

// One listener for the lifetime of the page.
let listenerAttached = false;

// Resolver for the current registration request.
let registrationResolver: ((fid: string | null) => void) | null = null;

// Prevent concurrent register() calls.
let inFlight: Promise<string | null> | null = null;

function ensureListener(messaging: Messaging) {
    if (listenerAttached) {
        return;
    }

    onRegistered(messaging, (fid) => {
        const resolve = registrationResolver;

        // Clear the resolver before resolving so future FID updates
        // don't resolve an already-completed request.
        registrationResolver = null;

        resolve?.(fid);
    });

    listenerAttached = true;
}

async function doRegister(): Promise<string | null> {
    if (typeof window === "undefined") {
        return null;
    }

    if (!("Notification" in window)) {
        return null;
    }

    if (!("serviceWorker" in navigator)) {
        return null;
    }

    let permission: NotificationPermission = Notification.permission;

    if (permission === "default") {
        permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
        return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        return null;
    }

    // 1. UNINSTALL/REINSTALL FIX: Ensure the new Service Worker is actually controlling the page.
    if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
            // Fallback timeout so it never hangs indefinitely
            setTimeout(resolve, 2000);
        });
    }

    // Reuse the existing Serwist service worker.
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    // 2. DEADLOCK FIX: Create the promise and assign the resolver FIRST.
    const fidPromise = new Promise<string | null>((resolve) => {
        registrationResolver = resolve;
    });

    // 3. Attach the callback ONLY AFTER the resolver exists.
    ensureListener(messaging);

    try {
        await register(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
            serviceWorkerRegistration,
        });
    } catch (error) {
        registrationResolver = null;
        console.error("[PUSH] Failed to register push notifications.", error);
        return null;
    }

    return fidPromise;
}

export async function registerPushNotifications(): Promise<string | null> {
    if (inFlight) {
        return inFlight;
    }

    inFlight = doRegister().finally(() => {
        inFlight = null;
    });

    return inFlight;
}
