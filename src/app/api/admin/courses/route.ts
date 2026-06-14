import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/require-role-api-route";

import type {
    Board,
    Category,
    Language,
    Subject,
    TargetExam,
} from "@/src/app/admin/batches/_features/zod-schema/schema";

import type {
    CourseDescription,
} from "@/src/app/admin/courses/_features/zod/course.schema";

const PAGE_SIZE = 20;

type CourseRow = {
    id: string;

    title: string;

    slug: string;

    subtitle: string | null;

    thumbnail_image: string | null;

    /* ---------- Category ---------- */

    category: Category;

    /* ---------- Academic ---------- */

    class_level: number | null;

    board: Board | null;

    target_exam: TargetExam | null;

    subjects: Subject[] | null;

    languages: Language[];

    /* ---------- Pricing ---------- */

    list_price: number;

    sale_price: number;

    /* ---------- Status ---------- */

    is_active: boolean;

    /* ---------- Content ---------- */

    description: CourseDescription;

    learning_outcomes: string[] | null;

    target_audience: string[] | null;

    /* ---------- Relations ---------- */

    instructors?: {
        id: string;
        full_name: string;
    }[];

    created_at: string;
};

type CourseQueryRow = Omit<
    CourseRow,
    "instructors"
> & {
    course_instructors?: {
        instructor: {
            id: string;
            full_name: string;
        } | null;
    }[];
};

type CourseListResponse = {
    items: CourseRow[];

    total: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export async function GET(
    request: NextRequest,
) {
    try {
        /* -------------------------------------------------- */
        /* Auth                                               */
        /* -------------------------------------------------- */

        const auth =
            await requireStaffApiRoute();

        if (
            !auth.authorized
        ) {
            return auth.response;
        }

        /* -------------------------------------------------- */
        /* Query Params                                       */
        /* -------------------------------------------------- */

        const searchParams =
            request.nextUrl
                .searchParams;

        const search =
            searchParams.get(
                "search",
            ) ?? "";

        const active =
            searchParams.get(
                "active",
            ) ?? "all";

        const category =
            searchParams.get(
                "category",
            ) ?? null;

        const board =
            searchParams.get(
                "board",
            ) ?? null;

        const classLevel =
            searchParams.get(
                "classLevel",
            ) ?? null;

        const targetExam =
            searchParams.get(
                "targetExam",
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

        /* -------------------------------------------------- */
        /* DB                                                 */
        /* -------------------------------------------------- */

        const supabase =
            await createServerSupabaseClient();

        /* -------------------------------------------------- */
        /* Instructor Filter                                  */
        /* -------------------------------------------------- */

        let courseIds:
            | string[]
            | null = null;

        if (
            instructorId
        ) {
            const {
                data,
                error,
            } =
                await supabase
                    .from(
                        "course_instructors",
                    )
                    .select(
                        "course_id",
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

            courseIds =
                data.map(
                    (row) =>
                        row.course_id,
                );

            if (
                courseIds.length ===
                0
            ) {
                const response: CourseListResponse =
                {
                    items: [],

                    total: 0,

                    page,

                    pageSize,

                    totalPages: 0,
                };

                return NextResponse.json(
                    response,
                );
            }
        }

        /* -------------------------------------------------- */
        /* Queries                                            */
        /* -------------------------------------------------- */

        let countQuery =
            supabase
                .from(
                    "courses",
                )
                .select(
                    "*",
                    {
                        count:
                            "exact",

                        head: true,
                    },
                );

        let dataQuery =
            supabase
                .from(
                    "courses",
                )
                .select(`
          id,
          title,
          slug,
          subtitle,
          thumbnail_image,

          category,

          class_level,
          board,
          target_exam,
          subjects,
          languages,

          list_price,
          sale_price,

          is_active,

          description,
          learning_outcomes,
          target_audience,

          created_at,

          course_instructors (
            instructor:users (
              id,
              full_name
            )
          )
        `);

        /* -------------------------------------------------- */
        /* Search                                             */
        /* -------------------------------------------------- */

        if (
            search.trim()
        ) {
            const filter =
                `title.ilike.%${search.trim()}%,subtitle.ilike.%${search.trim()}%`;

            countQuery =
                countQuery.or(
                    filter,
                );

            dataQuery =
                dataQuery.or(
                    filter,
                );
        }

        /* -------------------------------------------------- */
        /* Active                                             */
        /* -------------------------------------------------- */

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

        /* -------------------------------------------------- */
        /* Category                                           */
        /* -------------------------------------------------- */

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

        /* -------------------------------------------------- */
        /* Board                                              */
        /* -------------------------------------------------- */

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

        /* -------------------------------------------------- */
        /* Class Level                                        */
        /* -------------------------------------------------- */

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

        /* -------------------------------------------------- */
        /* Target Exam                                        */
        /* -------------------------------------------------- */

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

        /* -------------------------------------------------- */
        /* Instructor                                         */
        /* -------------------------------------------------- */

        if (
            courseIds
        ) {
            countQuery =
                countQuery.in(
                    "id",
                    courseIds,
                );

            dataQuery =
                dataQuery.in(
                    "id",
                    courseIds,
                );
        }

        /* -------------------------------------------------- */
        /* Execute                                            */
        /* -------------------------------------------------- */

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

        /* -------------------------------------------------- */
        /* Mapping                                            */
        /* -------------------------------------------------- */
        // Supabase incorrectly infers the shape of this query result.
        // Runtime verification confirms that `dataResult.data` is a
        // flat array of CourseQueryRow objects.
        const rows: CourseQueryRow[] =
            Array.isArray(
                dataResult.data,
            )
                ? (dataResult.data as unknown as CourseQueryRow[])
                : [];
        const items:
            CourseRow[] =
            rows.map(
                (
                    course,
                ) => {
                    const instructors =
                        course.course_instructors?.flatMap(
                            (
                                ci,
                            ) =>
                                ci.instructor
                                    ? [
                                        ci.instructor,
                                    ]
                                    : [],
                        ) ?? [];

                    return {
                        ...course,

                        instructors,
                    };
                },
            );

        const total =
            countResult.count ??
            0;

        const response: CourseListResponse =
        {
            items,

            total,

            page,

            pageSize,

            totalPages:
                Math.ceil(
                    total /
                    pageSize,
                ),
        };

        return NextResponse.json(
            response,
        );
    } catch (
    error
    ) {
        console.error(
            "[ADMIN_COURSES_GET_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load courses",
            },
            {
                status: 500,
            },
        );
    }
}
