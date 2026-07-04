import "server-only";

import { firebaseMessaging } from "./admin";
import { createServerSupabaseClient } from "../supabase/supabase-server";
import { BatchResponse } from "firebase-admin/messaging";

type PushAudience =
    | {
        type: "all";
    }
    | {
        type: "batch";
        batchId: string;
    }
    | {
        type: "selected";
        batchId: string;
        studentIds: string[];
    };

type SendPushNotificationInput = {
    title: string;
    body: string;
    type: string;

    audience: PushAudience;

    link?: string;
    tag?: string;

    data?: Record<string, string>;
};

type SendPushNotificationResult = {
    requested: number;
    sent: number;
    failed: number;
    removed: number;
};

async function sendMessages(
    supabase: Awaited<
        ReturnType<typeof createServerSupabaseClient>
    >,
    fids: string[],
    {
        title,
        body,
        type,
        link,
        tag,
        data,
    }: Omit<
        SendPushNotificationInput & {
            link: string;
        },
        "audience"
    >
): Promise<SendPushNotificationResult> {
    // Prevent duplicate sends if duplicate registrations exist.
    const uniqueFids = [...new Set(fids)];

    if (!uniqueFids.length) {
        return {
            requested: 0,
            sent: 0,
            failed: 0,
            removed: 0,
        };
    }

    const messages = uniqueFids.map((fid) => ({
        fid,

        data: {
            title,
            body,
            type,

            link,

            tag: tag ?? "",

            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-badge-96x96.png",

            vibrate: JSON.stringify([200, 100, 200]),

            ...data,
        },
    }));

    let response: BatchResponse;

    try {
        response = await firebaseMessaging.sendEach(messages);
    } catch (error) {
        console.error(
            "[PUSH_NOTIFICATION_FIREBASE_ERROR]",
            error
        );

        throw error;
    }

    const staleFids = new Set<string>();

    response.responses.forEach((result, index) => {
        if (result.success) {
            return;
        }

        const code = result.error?.code;

        switch (code) {
            case "messaging/installation-id-not-registered":
            case "messaging/registration-token-not-registered":
                staleFids.add(uniqueFids[index]);
                break;

            default:
                console.error(
                    "[PUSH_NOTIFICATION_SEND_ERROR]",
                    {
                        fid: uniqueFids[index],
                        code,
                        message: result.error?.message,
                    }
                );
        }
    });

    if (staleFids.size) {
        const { error } = await supabase
            .from("push_registrations")
            .delete()
            .in("fid", [...staleFids]);

        if (error) {
            console.error(
                "[PUSH_NOTIFICATION_CLEANUP_ERROR]",
                error
            );
        }
    }

    return {
        requested: uniqueFids.length,
        sent: response.successCount,
        failed: response.failureCount,
        removed: staleFids.size,
    };
}

export async function sendPushNotification({
    title,
    body,
    type,
    audience,
    link = "/student/dashboard",
    tag,
    data = {},
}: SendPushNotificationInput): Promise<SendPushNotificationResult> {
    const supabase = await createServerSupabaseClient();

    if (
        audience.type === "selected" &&
        audience.studentIds.length === 0
    ) {
        return {
            requested: 0,
            sent: 0,
            failed: 0,
            removed: 0,
        };
    }

    if (audience.type === "all") {
        const { data: registrations, error } = await supabase
            .from("push_registrations")
            .select("fid");

        if (error) {
            throw error;
        }

        return sendMessages(
            supabase,
            registrations?.map((r) => r.fid) ?? [],
            {
                title,
                body,
                type,
                link,
                tag,
                data,
            }
        );
    }

    let enrollmentQuery = supabase
        .from("enrollments")
        .select("user_id")
        .eq("target_type", "batch")
        .eq("batch_id", audience.batchId)
        .eq("is_active", true);

    if (audience.type === "selected") {
        enrollmentQuery = enrollmentQuery.in(
            "user_id",
            audience.studentIds
        );
    }

    const {
        data: enrollments,
        error: enrollmentError,
    } = await enrollmentQuery;

    if (enrollmentError) {
        throw enrollmentError;
    }

    const userIds =
        enrollments?.map((e) => e.user_id) ?? [];

    if (!userIds.length) {
        return {
            requested: 0,
            sent: 0,
            failed: 0,
            removed: 0,
        };
    }

    const {
        data: registrations,
        error: registrationError,
    } = await supabase
        .from("push_registrations")
        .select("fid")
        .in("user_id", userIds);

    if (registrationError) {
        throw registrationError;
    }

    return sendMessages(
        supabase,
        registrations?.map((r) => r.fid) ?? [],
        {
            title,
            body,
            type,
            link,
            tag,
            data,
        }
    );
}
