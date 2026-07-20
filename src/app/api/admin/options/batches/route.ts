import {
    connection,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffApiRoute } from "@/src/lib/auth/claims/require-role-api-route";

type BatchSelectItem = {
    id: string;
    title: string;
};

type TeacherBatchRow = {
    batch: BatchSelectItem | null;
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
                .from("batches")
                .select(`
          id,
          title
        `)
                .eq(
                    "is_active",
                    true,
                )
                .order("title")
                .overrideTypes<
                    BatchSelectItem[],
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
                "batch_instructors",
            )
            .select(`
        batch:batches!inner (
          id,
          title
        )
      `)
            .eq(
                "instructor_id",
                auth.user.userId,
            )
            .eq(
                "batch.is_active",
                true,
            )
            .order(
                "title",
                {
                    referencedTable:
                        "batch",
                },
            )
            .overrideTypes<
                TeacherBatchRow[],
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
            BatchSelectItem[] =
            (
                data ?? []
            ).flatMap(
                (row) =>
                    row.batch
                        ? [row.batch]
                        : [],
            );

        return NextResponse.json(
            batches,
        );
    } catch (error) {
        console.error(
            "[ADMIN_BATCH_OPTIONS_ERROR]",
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
