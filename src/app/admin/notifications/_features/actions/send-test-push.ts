"use server";

import { firebaseMessaging } from "@/src/lib/firebase/admin";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

export async function sendTestPush(): Promise<
    ServerActionResponse<void>
> {
    // redirect() throws internally; keep outside try/catch
    await requireStaffServerOnly();

    try {
        console.log("[SEND_TEST_PUSH] Starting...");

        const supabase = await createServerSupabaseClient();

        /* ---------- get one registered device ---------- */

        const { data: registration, error } = await supabase
            .from("push_registrations")
            .select("fid")
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(
                "[SEND_TEST_PUSH_FETCH_ERROR]",
                error
            );

            return {
                error: "Failed to load push registration.",
            };
        }

        if (!registration) {
            console.warn(
                "[SEND_TEST_PUSH] No push registration found."
            );

            return {
                error: "No registered device found.",
            };
        }

        console.log(
            "[SEND_TEST_PUSH] Found registration:",
            registration
        );

        console.log(
            "[SEND_TEST_PUSH] Sending to FID:",
            registration.fid
        );

        /* ---------- send push ---------- */


        const messageId = await firebaseMessaging.send({
            fid: registration.fid,

            webpush: {
                notification: {
                    title: "🎉 Push notifications are working!",
                    body: "Hello from Firebase!",

                    // Main app icon
                    icon: "/icons/icon-192x192.png",

                    // Small monochrome badge (mostly Android)
                    badge: "/icons/icon-192x192.png",

                    // Group notifications with the same tag.
                    // Later you can use notification IDs or types.
                    tag: "test",

                    // If another notification with the same tag arrives,
                    // alert the user again.
                    renotify: true,

                    // Default is false; included for clarity.
                    silent: false,

                    // Nice subtle vibration pattern where supported.
                    vibrate: [200, 100, 200],
                },

                // Open this page when the notification is clicked.
                fcmOptions: {
                    link: "/student/notifications",
                },
            },

            data: {
                type: "test",
            },
        });

        console.log(
            "[SEND_TEST_PUSH_SUCCESS] Message ID:",
            messageId
        );

        return {
            data: undefined,
        };
    } catch (error) {
        console.error(
            "[SEND_TEST_PUSH_FATAL]",
            error
        );

        if (error instanceof Error) {
            console.error(
                "[SEND_TEST_PUSH_FATAL_MESSAGE]",
                error.message
            );

            console.error(
                "[SEND_TEST_PUSH_FATAL_STACK]",
                error.stack
            );
        }

        return {
            error: "Failed to send push notification.",
        };
    }
}
