import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

import type { CourseSelectItem } from "@/src/app/admin/batches/_features/types/types";

type TeacherCourseRow = {
    course: {
        id: string;
        title: string;
        is_active: boolean;
    } | null;
};

export async function GET() {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireStaffApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const supabase =
            await createServerSupabaseClient();

        /* ---------- Admin ---------- */

        if (
            auth.user.role ===
            "admin"
        ) {
            const {
                data,
                error,
            } = await supabase
                .from("courses")
                .select(`
          id,
          title,
          is_active
        `)
                .order("title")
                .overrideTypes<
                    CourseSelectItem[],
                    {
                        merge: false;
                    }
                >();

            if (error) {
                throw new Error(
                    error.message,
                );
            }

            return NextResponse.json(
                data ?? [],
            );
        }

        /* ---------- Teacher ---------- */

        const {
            data,
            error,
        } = await supabase
            .from(
                "course_instructors",
            )
            .select(`
        course:courses (
          id,
          title,
          is_active
        )
      `)
            .eq(
                "instructor_id",
                auth.user.userId,
            )
            .overrideTypes<
                TeacherCourseRow[],
                {
                    merge: false;
                }
            >();

        if (error) {
            throw new Error(
                error.message,
            );
        }

        const courses:
            CourseSelectItem[] =
            (
                data ?? []
            ).flatMap(
                (row) =>
                    row.course
                        ? [row.course]
                        : [],
            );

        return NextResponse.json(
            courses,
        );
    } catch (error) {
        console.error(
            "[ADMIN_COURSE_OPTIONS_ERROR]",
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
