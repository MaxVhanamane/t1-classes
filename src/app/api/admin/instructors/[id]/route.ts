import { instructorUpdateSchema } from "@/src/app/admin/instructors/_features/zod/instructor.server.schema";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = {
    params: Promise<{ id: string }>;
};

/* ---------------------------------- */
/* PUT                                */
/* ---------------------------------- */

export async function PUT(
    req: Request,
    { params }: Params
) {
    await getCurrentAdmin()
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const json = await req.json();

    const parsed = instructorUpdateSchema.safeParse(json);

    if (!parsed.success) {
        return NextResponse.json(
            {
                message: "Invalid data",
                errors: z.treeifyError(parsed.error),
            },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from("instructors")
        .update(parsed.data)
        .eq("id", id);

    if (error) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}

/* ---------------------------------- */
/* DELETE                             */
/* ---------------------------------- */

import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";

/* ---------------------------------- */
/* DELETE                             */
/* ---------------------------------- */

export async function DELETE(
    _req: Request,
    { params }: Params
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    await getCurrentAdmin()

    /* 1 Get existing image */
    const { data: existing, error: fetchError } =
        await supabase
            .from("instructors")
            .select("profile_image")
            .eq("id", id)
            .single();

    if (fetchError) {
        return NextResponse.json(
            { message: fetchError.message },
            { status: 500 }
        );
    }

    const imageKey = existing?.profile_image;

    /* 2 Delete DB row */
    const { error: deleteError } = await supabase
        .from("instructors")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return NextResponse.json(
            { message: deleteError.message },
            { status: 500 }
        );
    }

    /* 3 Delete R2 object (non-blocking safe) */
    if (imageKey) {
        await deleteR2Object(
            process.env.R2_PUBLIC_BUCKET_NAME!,
            imageKey
        ).catch(console.error);
    }

    return NextResponse.json({ success: true });
}
