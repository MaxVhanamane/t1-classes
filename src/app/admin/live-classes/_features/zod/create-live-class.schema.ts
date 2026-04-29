import { z } from "zod";

function extractYoutubeLiveId(
    value: string,
): string {
    const input =
        value.trim();

    if (!input) {
        return "";
    }

    /* User pasted plain ID */
    if (
        !input.includes(
            "http",
        ) &&
        !input.includes("/")
    ) {
        return input;
    }

    try {
        const url =
            new URL(input);

        const host =
            url.hostname.replace(
                "www.",
                "",
            );

        /* youtube.com/live/ID */
        if (
            host ===
            "youtube.com" &&
            url.pathname.startsWith(
                "/live/",
            )
        ) {
            const id =
                url.pathname
                    .replace(
                        "/live/",
                        "",
                    )
                    .split("/")[0]
                    .trim();

            return id;
        }

        /* youtube.com/watch?v=ID */
        if (
            host ===
            "youtube.com"
        ) {
            const id =
                url.searchParams.get(
                    "v",
                );

            if (id) {
                return id.trim();
            }
        }

        /* youtu.be/ID */
        if (
            host ===
            "youtu.be"
        ) {
            const id =
                url.pathname
                    .replace(
                        "/",
                        "",
                    )
                    .split("/")[0]
                    .trim();

            return id;
        }

        return input;
    } catch {
        return input;
    }
}

export const createLiveClassSchema =
    z
        .object({
            title: z
                .string()
                .trim()
                .min(
                    3,
                    "Title must be at least 3 characters",
                )
                .max(
                    120,
                    "Title must be at most 120 characters",
                ),

            batch_ids: z
                .array(
                    z.uuid(),
                )
                .min(
                    1,
                    "Select at least one batch",
                ),

            starts_at: z
                .string()
                .min(
                    1,
                    "Start date and time is required",
                ),

            ends_at: z
                .string()
                .min(
                    1,
                    "End date and time is required",
                ),

            youtube_live_id: z
                .string()
                .trim()
                .min(
                    1,
                    "YouTube live link or ID is required",
                )
                .transform(
                    (
                        value,
                    ) =>
                        extractYoutubeLiveId(
                            value,
                        ),
                )
                .refine(
                    (
                        value,
                    ) =>
                        value.trim()
                            .length >
                        0,
                    {
                        message:
                            "Invalid YouTube live link or ID",
                    },
                ),

            description: z
                .string()
                .trim()
                .max(
                    1000,
                    "Description must be at most 1000 characters",
                )
                .optional(),
        })
        .superRefine(
            (
                data,
                ctx,
            ) => {
                if (
                    data.starts_at &&
                    data.ends_at
                ) {
                    const startsAt =
                        new Date(
                            data.starts_at,
                        );

                    const endsAt =
                        new Date(
                            data.ends_at,
                        );

                    if (
                        endsAt <=
                        startsAt
                    ) {
                        ctx.addIssue(
                            {
                                code: "custom",
                                path: [
                                    "ends_at",
                                ],
                                message:
                                    "End time must be after start time",
                            },
                        );
                    }
                }
            },
        );

export type CreateLiveClassInput =
    z.infer<
        typeof createLiveClassSchema
    >;
