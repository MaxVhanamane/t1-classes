import { onRegistered, register, type Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./client";

// Ensure we only attach the onRegistered listener once per page load.
let listenerAttached = false;

// Resolver for the initial registration request on page load.
let registrationResolver: ((fid: string | null) => void) | null = null;

// Persistent callback for mid-session FID rotations triggered by Firebase.
let onFidUpdateCallback: ((fid: string) => void) | null = null;

// Prevent concurrent register() calls if the hook mounts twice quickly.
let inFlight: Promise<string | null> | null = null;

function ensureListener(messaging: Messaging) {
    if (listenerAttached) {
        return;
    }

    onRegistered(messaging, (fid) => {
        // 1. Resolve the initial page-load promise if it's waiting
        if (registrationResolver) {
            const resolve = registrationResolver;
            // Clear the resolver so it doesn't accidentally fire again
            registrationResolver = null;
            resolve(fid);
        }

        // 2. Trigger the continuous callback for any mid-session rotations
        // This ensures if Firebase changes the token while the user is using the app,
        // we can instantly sync it with the database.
        if (onFidUpdateCallback) {
            onFidUpdateCallback(fid);
        }
    });

    listenerAttached = true;
}

async function doRegister(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    if (!("Notification" in window)) return null;
    if (!("serviceWorker" in navigator)) return null;

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

    // [FIX 1]: UNINSTALL/REINSTALL DEADLOCK
    // When a PWA is reinstalled, the new Service Worker might not be controlling the page yet.
    // If we call register() too early, it silently fails. This waits for the SW to take control.
    if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
            // 2-second fallback timeout so the app never hangs indefinitely
            setTimeout(resolve, 2000);
        });
    }

    // Reuse the existing Serwist/Workbox service worker registration.
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    // [FIX 2]: RACE CONDITION DEADLOCK
    // We MUST create the promise and assign the resolver BEFORE attaching the listener.
    // Otherwise, Firebase might fire onRegistered instantly and we miss the event.
    const fidPromise = new Promise<string | null>((resolve) => {
        registrationResolver = resolve;
    });

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

/**
 * Registers this browser with Firebase Cloud Messaging.
 * @param onUpdate Optional callback that fires if Firebase rotates the FID mid-session.
 */
export async function registerPushNotifications(
    onUpdate?: (fid: string) => void
): Promise<string | null> {
    // Attach the continuous rotation handler if provided by the React hook
    if (onUpdate) {
        onFidUpdateCallback = onUpdate;
    }

    if (inFlight) {
        return inFlight;
    }

    inFlight = doRegister().finally(() => {
        inFlight = null;
    });

    return inFlight;
}
