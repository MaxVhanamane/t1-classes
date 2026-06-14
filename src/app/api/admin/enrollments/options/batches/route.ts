import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

import type {
    BatchOption,
    BatchSupabaseRow,
} from "@/src/app/admin/enrollments/_features/types/enrollments.types";

export async function GET() {
    await connection();

    try {
        /* ---------- Auth ---------- */

        const auth =
            await requireAdminApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        const supabase =
            await createServerSupabaseClient();

        const today =
            new Date().toISOString();

        /* ---------- DB ---------- */

        const {
            data,
            error,
        } = await supabase
            .from("batches")
            .select(`
        id,
        title,
        is_active,
        start_date,
        end_date,
        is_admission_open,
        batch_courses (
          course:courses (
            id,
            title
          )
        )
      `)
            .eq(
                "is_active",
                true,
            )
            .eq(
                "is_admission_open",
                true,
            )
            .or(
                `start_date.gt.${today},and(start_date.lte.${today},end_date.gte.${today})`,
            )
            .order(
                "start_date",
                {
                    ascending: true,
                },
            )
            .overrideTypes<
                BatchSupabaseRow[],
                {
                    merge: false;
                }
            >();

        if (error) {
            throw new Error(
                error.message,
            );
        }

        const batches:
            BatchOption[] =
            (
                data ?? []
            ).map((batch) => ({
                id: batch.id,

                title:
                    batch.title,

                start_date:
                    batch.start_date,

                end_date:
                    batch.end_date,

                is_active:
                    batch.is_active,

                is_admission_open:
                    batch.is_admission_open,

                courses:
                    batch.batch_courses.map(
                        (bc) => ({
                            title:
                                bc.course.title,
                        }),
                    ),
            }));

        return NextResponse.json(
            batches,
        );
    } catch (error) {
        console.error(
            "[ADMIN_ENROLLMENT_BATCH_OPTIONS_ERROR]",
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
