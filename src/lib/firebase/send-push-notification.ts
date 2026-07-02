import "server-only";

import { firebaseMessaging } from "./admin";
import { createServerSupabaseClient } from "../supabase/supabase-server";

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
};

async function sendMessages(
    fids: string[],
    {
        title,
        body,
        type,
        link,
        tag,
        data,
    }: Omit<SendPushNotificationInput & { link: string }, "audience">
): Promise<SendPushNotificationResult> {
    if (!fids.length) {
        return {
            requested: 0,
            sent: 0,
            failed: 0,
        };
    }

    const messages = fids.map((fid) => ({
        fid,

        data: {
            title,
            body,
            type,

            link,

            tag: tag ?? "",

            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-192x192.png",

            vibrate: JSON.stringify([200, 100, 200]),

            ...data,
        },
    }));

    const response = await firebaseMessaging.sendEach(messages);

    return {
        requested: messages.length,
        sent: response.successCount,
        failed: response.failureCount,
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

    if (audience.type === "all") {
        const { data: registrations, error } = await supabase
            .from("push_registrations")
            .select("fid");

        if (error) {
            throw error;
        }

        return sendMessages(
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
