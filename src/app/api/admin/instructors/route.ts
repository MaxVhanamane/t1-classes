import { instructorInsertSchema } from "@/src/app/admin/instructors/_features/zod/instructor.server.schema";
import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";

/* ---------------------------------- */
/* GET                                */
/* ---------------------------------- */

export async function GET() {
    const auth = await requireAdminApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { message: "Failed to fetch instructors" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

/* ---------------------------------- */
/* POST                               */
/* ---------------------------------- */

export async function POST(req: Request) {

    const auth = await requireAdminApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }
    const supabase = await createServerSupabaseClient();

    const json = await req.json();

    const parsed = instructorInsertSchema.safeParse(json);


    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Invalid data",
                errors: z.treeifyError(parsed.error),
            },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("instructors")
        .insert(parsed.data)
        .select()
        .single();

    if (error) {
        console.log("Error inserting instructor:", error);

        // Handle duplicate email error
        if (
            error.code === "23505" &&
            error.message.includes("instructors_email_key")
        ) {
            return NextResponse.json(
                {
                    message: "This email already exists. Please use a different email.",
                    field: "email",
                },
                { status: 409 } // Conflict
            );
        }

        return NextResponse.json(
            { message: "Failed to create instructor. Please try again." },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
