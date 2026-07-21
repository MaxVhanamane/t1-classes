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

        async function syncPushRegistration() {
            try {
                if (
                    typeof Notification === "undefined" ||
                    Notification.permission === "denied"
                ) {
                    return;
                }

                const fid = await registerPushNotifications();

                if (!fid) {
                    return;
                }

                const cachedFid = localStorage.getItem(PUSH_STORAGE_KEY);

                // Nothing changed.
                if (cachedFid === fid) {
                    return;
                }

                const result = await callServerAction(
                    savePushRegistration({
                        fid,
                        userAgent: navigator.userAgent,
                    })
                );

                if (result.error) {
                    console.error(
                        "[PUSH] Failed to save registration:",
                        result.error
                    );

                    return;
                }

                localStorage.setItem(PUSH_STORAGE_KEY, fid);
            } catch (error) {
                console.error(
                    "[PUSH_REGISTRATION_ERROR]",
                    error
                );
            }
        }

        void syncPushRegistration();
    }, []);
}
