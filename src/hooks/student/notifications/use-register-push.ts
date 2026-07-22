"use client";

import { useEffect, useRef } from "react";

import { registerPushNotifications } from "@/src/lib/firebase/register-push";
import { savePushRegistration } from "@/src/app/admin/notifications/_features/actions/save-push-registration";
import { callServerAction } from "@/src/lib/actions/call-server-action";

export const PUSH_STORAGE_KEY = "push_registration_fid";

export function useRegisterPush() {
    // Prevent React Strict Mode from starting the registration flow twice.
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current) {
            return;
        }

        hasStarted.current = true;

        /**
         * Reusable sync handler. 
         * Used for BOTH the initial page load AND mid-session token rotations.
         */
        async function handleFidSync(fid: string) {
            const cachedFid = localStorage.getItem(PUSH_STORAGE_KEY);

            // PREVENT UNNECESSARY DB WRITES:
            // If the local cache matches the FID, the server already knows about this device.
            if (cachedFid === fid) {
                return;
            }

            // The FID is new or the cache was cleared (e.g., on login). 
            // We must sync it with the database to maintain the "1 User = 1 Device" rule.
            const result = await callServerAction(
                savePushRegistration({
                    fid,
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                })
            );

            if (result.error) {
                return;
            }

            // Successfully synced with server. Update the cache to prevent future writes.
            localStorage.setItem(PUSH_STORAGE_KEY, fid);
        }

        async function initPushRegistration() {
            try {
                if (
                    typeof Notification === "undefined" ||
                    Notification.permission === "denied"
                ) {
                    return;
                }

                // Initialize Firebase. 
                // We pass `handleFidSync` so Firebase can call it if the token rotates later.
                const initialFid = await registerPushNotifications(handleFidSync);

                if (!initialFid) {
                    return;
                }

                // Process the initial FID fetched on page load
                await handleFidSync(initialFid);

            } catch {

            }
        }

        void initPushRegistration();
    }, []);
}
