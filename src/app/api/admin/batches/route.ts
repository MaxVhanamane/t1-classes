import {
    connection,
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type {
    BatchListItem,
} from "@/src/app/admin/batches/_features/types/types";

const PAGE_SIZE = 20;

type BatchRow = Omit<
    BatchListItem,
    "instructors"
> & {
    batch_instructors?: {
        instructor: {
            id: string;
            full_name: string;
        } | null;
    }[];
};

export async function GET(
    request: NextRequest,
) {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireAdminApiRoute();

        if (
            !auth.authorized
        ) {
            return auth.response;
        }

        /* ---------- Params ---------- */

        const searchParams =
            request.nextUrl
                .searchParams;

        const search =
            searchParams
                .get("search")
                ?.trim() ?? "";

        const active =
            searchParams.get(
                "active",
            ) ?? "all";

        const lifecycle =
            searchParams.get(
                "lifecycle",
            ) ?? null;

        const admission =
            searchParams.get(
                "admission",
            ) ?? null;

        const category =
            searchParams.get(
                "category",
            ) ?? null;

        const board =
            searchParams.get(
                "board",
            ) ?? null;

        const mode =
            searchParams.get(
                "mode",
            ) ?? null;

        const classLevel =
            searchParams.get(
                "classLevel",
            ) ?? null;

        const targetExam =
            searchParams.get(
                "targetExam",
            ) ?? null;

        const courseId =
            searchParams.get(
                "courseId",
            ) ?? null;

        const instructorId =
            searchParams.get(
                "instructorId",
            ) ?? null;

        const page =
            Math.max(
                Number(
                    searchParams.get(
                        "page",
                    ) ?? "1",
                ),
                1,
            );

        const pageSize =
            PAGE_SIZE;

        const from =
            (page - 1) *
            pageSize;

        const to =
            from +
            pageSize -
            1;

        /* ---------- DB ---------- */

        const supabase =
            await createServerSupabaseClient();

        /* ---------- Relationship Filters ---------- */

        let batchIds:
            | string[]
            | null =
            null;

        if (courseId) {
            const {
                data,
                error,
            } =
                await supabase
                    .from(
                        "batch_courses",
                    )
                    .select(
                        "batch_id",
                    )
                    .eq(
                        "course_id",
                        courseId,
                    );

            if (error) {
                throw new Error(
                    error.message,
                );
            }

            batchIds =
                data.map(
                    (
                        item,
                    ) =>
                        item.batch_id,
                );
        }

        if (
            instructorId
        ) {
            const {
                data,
                error,
            } =
                await supabase
                    .from(
                        "batch_instructors",
                    )
                    .select(
                        "batch_id",
                    )
                    .eq(
                        "instructor_id",
                        instructorId,
                    );

            if (error) {
                throw new Error(
                    error.message,
                );
            }

            const instructorBatchIds =
                data.map(
                    (
                        item,
                    ) =>
                        item.batch_id,
                );

            batchIds =
                batchIds ===
                    null
                    ? instructorBatchIds
                    : batchIds.filter(
                        (
                            id,
                        ) =>
                            instructorBatchIds.includes(
                                id,
                            ),
                    );
        }

        if (
            batchIds &&
            batchIds.length ===
            0
        ) {
            return NextResponse.json(
                {
                    items: [],

                    page,

                    total: 0,

                    totalPages: 0,

                    pageSize,
                },
            );
        }

        /* ---------- Queries ---------- */

        let countQuery =
            supabase
                .from(
                    "batches",
                )
                .select(
                    "*",
                    {
                        count:
                            "exact",

                        head: true,
                    },
                );

        let dataQuery = supabase
            .from("batches")
            .select(`
        id,
        title,
        slug,
        subtitle,
        description,
        sale_price,
        list_price,
        thumbnail_image,
        subjects,
        class_level,
        target_exam,
        mode,
        location,
        languages,
        is_active,
        is_admission_open,
        start_date,
        end_date,
        capacity,
        learning_outcomes,
        target_audience,
        address,
        category,
        board,
        courses:batch_courses (
            course:courses (
                id,
                title
            )
        ),
        batch_instructors (
            instructor:users (
                id,
                full_name
            )
        )
    `);

        /* ---------- Search ---------- */

        if (
            search.length >
            0
        ) {
            const filter = `title.ilike.%${search}%,slug.ilike.%${search}%,subtitle.ilike.%${search}%`;
            countQuery =
                countQuery.or(
                    filter,
                );

            dataQuery =
                dataQuery.or(
                    filter,
                );
        }

        /* ---------- Active ---------- */

        if (
            active ===
            "active"
        ) {
            countQuery =
                countQuery.eq(
                    "is_active",
                    true,
                );

            dataQuery =
                dataQuery.eq(
                    "is_active",
                    true,
                );
        }

        if (
            active ===
            "inactive"
        ) {
            countQuery =
                countQuery.eq(
                    "is_active",
                    false,
                );

            dataQuery =
                dataQuery.eq(
                    "is_active",
                    false,
                );
        }

        /* ---------- Lifecycle ---------- */

        const today =
            new Date()
                .toISOString()
                .split(
                    "T",
                )[0];

        if (
            lifecycle ===
            "upcoming"
        ) {
            countQuery =
                countQuery.gt(
                    "start_date",
                    today,
                );

            dataQuery =
                dataQuery.gt(
                    "start_date",
                    today,
                );
        }

        if (
            lifecycle ===
            "ongoing"
        ) {
            countQuery =
                countQuery
                    .lte(
                        "start_date",
                        today,
                    )
                    .gte(
                        "end_date",
                        today,
                    );

            dataQuery =
                dataQuery
                    .lte(
                        "start_date",
                        today,
                    )
                    .gte(
                        "end_date",
                        today,
                    );
        }

        if (
            lifecycle ===
            "completed"
        ) {
            countQuery =
                countQuery.lt(
                    "end_date",
                    today,
                );

            dataQuery =
                dataQuery.lt(
                    "end_date",
                    today,
                );
        }

        /* ---------- Admission ---------- */

        if (
            admission ===
            "open"
        ) {
            countQuery =
                countQuery.eq(
                    "is_admission_open",
                    true,
                );

            dataQuery =
                dataQuery.eq(
                    "is_admission_open",
                    true,
                );
        }

        if (
            admission ===
            "closed"
        ) {
            countQuery =
                countQuery.eq(
                    "is_admission_open",
                    false,
                );

            dataQuery =
                dataQuery.eq(
                    "is_admission_open",
                    false,
                );
        }

        /* ---------- Simple Filters ---------- */

        if (
            category
        ) {
            countQuery =
                countQuery.eq(
                    "category",
                    category,
                );

            dataQuery =
                dataQuery.eq(
                    "category",
                    category,
                );
        }

        if (
            board
        ) {
            countQuery =
                countQuery.eq(
                    "board",
                    board,
                );

            dataQuery =
                dataQuery.eq(
                    "board",
                    board,
                );
        }

        if (mode) {
            countQuery =
                countQuery.eq(
                    "mode",
                    mode,
                );

            dataQuery =
                dataQuery.eq(
                    "mode",
                    mode,
                );
        }

        if (
            classLevel
        ) {
            countQuery =
                countQuery.eq(
                    "class_level",
                    Number(
                        classLevel,
                    ),
                );

            dataQuery =
                dataQuery.eq(
                    "class_level",
                    Number(
                        classLevel,
                    ),
                );
        }

        if (
            targetExam
        ) {
            countQuery =
                countQuery.eq(
                    "target_exam",
                    targetExam,
                );

            dataQuery =
                dataQuery.eq(
                    "target_exam",
                    targetExam,
                );
        }

        /* ---------- Relationship Filters ---------- */

        if (
            batchIds
        ) {
            countQuery =
                countQuery.in(
                    "id",
                    batchIds,
                );

            dataQuery =
                dataQuery.in(
                    "id",
                    batchIds,
                );
        }

        /* ---------- Execute ---------- */

        const [
            countResult,
            dataResult,
        ] =
            await Promise.all(
                [
                    countQuery,

                    dataQuery
                        .order(
                            "created_at",
                            {
                                ascending: false,
                            },
                        )
                        .range(
                            from,
                            to,
                        ),
                ],
            );

        if (
            countResult.error
        ) {
            throw new Error(
                countResult
                    .error
                    .message,
            );
        }

        if (
            dataResult.error
        ) {
            throw new Error(
                dataResult
                    .error
                    .message,
            );
        }

        /* ---------- Transform ---------- */

        // Supabase incorrectly infers nested aliases (courses.course)
        // as arrays. Runtime shape verified via logging.
        const rows: BatchRow[] =
            Array.isArray(
                dataResult.data,
            )
                ? (dataResult.data as unknown as BatchRow[])
                : [];

        const items:
            BatchListItem[] =
            rows.map(
                (
                    batch,
                ) => ({
                    ...batch,

                    instructors:
                        batch.batch_instructors?.flatMap(
                            (
                                item,
                            ) =>
                                item.instructor
                                    ? [
                                        item.instructor,
                                    ]
                                    : [],
                        ) ??
                        [],
                }),
            );

        const total =
            countResult.count ??
            0;

        /* ---------- Response ---------- */

        return NextResponse.json(
            {
                items,

                page,

                total,

                totalPages:
                    Math.ceil(
                        total /
                        pageSize,
                    ),

                pageSize,
            },
        );
    } catch (
    error
    ) {
        console.error(
            "[ADMIN_BATCHES_GET_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load batches",
            },
            {
                status: 500,
            },
        );
    }
}
