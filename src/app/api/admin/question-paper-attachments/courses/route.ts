import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

type CourseSelectorItem = {
    id: string;

    title: string;

    class_level: number | null;

    target_exam: string | null;
};

type CourseSelectorResponse = {
    items: CourseSelectorItem[];

    totalCount: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export async function GET(
    request: NextRequest,
) {
    try {
        const auth =
            await requireAdminApiRoute();

        if (
            !auth.authorized
        ) {
            return auth.response;
        }

        const searchParams =
            request.nextUrl.searchParams;

        const search =
            searchParams.get(
                "search",
            ) ?? "";

        const classLevel =
            searchParams.get(
                "classLevel",
            );

        const targetExam =
            searchParams.get(
                "targetExam",
            );

        const page = Math.max(
            Number(
                searchParams.get(
                    "page",
                ) ?? "1",
            ),
            1,
        );

        const pageSize = Math.min(
            Math.max(
                Number(
                    searchParams.get(
                        "pageSize",
                    ) ?? "20",
                ),
                1,
            ),
            100,
        );

        const from =
            (page - 1) *
            pageSize;

        const to =
            from +
            pageSize -
            1;

        const supabase =
            await createServerSupabaseClient();

        let countQuery =
            supabase
                .from("courses")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq(
                    "is_active",
                    true,
                );

        let dataQuery =
            supabase
                .from("courses")
                .select(`
          id,
          title,
          class_level,
          target_exam
        `)
                .eq(
                    "is_active",
                    true,
                );

        if (
            search.trim()
        ) {
            countQuery =
                countQuery.ilike(
                    "title",
                    `%${search.trim()}%`,
                );

            dataQuery =
                dataQuery.ilike(
                    "title",
                    `%${search.trim()}%`,
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

        const [
            countResult,
            dataResult,
        ] =
            await Promise.all([
                countQuery,

                dataQuery
                    .order(
                        "title",
                        {
                            ascending:
                                true,
                        },
                    )
                    .range(
                        from,
                        to,
                    ),
            ]);

        if (
            countResult.error
        ) {
            return NextResponse.json(
                {
                    message:
                        countResult.error
                            .message,
                },
                {
                    status: 500,
                },
            );
        }

        if (
            dataResult.error
        ) {
            return NextResponse.json(
                {
                    message:
                        dataResult.error
                            .message,
                },
                {
                    status: 500,
                },
            );
        }

        const items:
            CourseSelectorItem[] =
            Array.isArray(
                dataResult.data,
            )
                ? (dataResult.data as CourseSelectorItem[])
                : [];

        const totalCount =
            countResult.count ??
            0;

        const response: CourseSelectorResponse =
        {
            items,

            totalCount,

            page,

            pageSize,

            totalPages:
                Math.ceil(
                    totalCount /
                    pageSize,
                ),
        };

        return NextResponse.json(
            response,
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Failed to load courses.",
            },
            {
                status: 500,
            },
        );
    }
}
