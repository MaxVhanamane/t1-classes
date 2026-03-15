import { instructorInsertSchema } from "@/src/app/admin/instructors/_features/zod/instructor.server.schema";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";

/* ---------------------------------- */
/* GET                                */
/* ---------------------------------- */

export async function GET() {
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
    await getCurrentAdmin()
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
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
