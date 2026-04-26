import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

/* ---------------------------------- */
/* Schemas                            */
/* ---------------------------------- */

const paramsSchema = z.object({
    id: z.uuid(),
});

const avatarSchema = z.object({
    profile_image: z.string().trim().min(1),
});

/* ---------------------------------- */
/* PUT                                */
/* ---------------------------------- */

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdminApiRoute();

    if (!auth.authorized) {
        return auth.response;
    }


    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();

    /* Validate ID */
    const parsedParams = paramsSchema.safeParse({ id });
    if (!parsedParams.success) {
        return NextResponse.json(
            { message: "Invalid instructor ID" },
            { status: 400 }
        );
    }

    /* Validate Body */
    const json = await req.json();
    const parsedBody = avatarSchema.safeParse(json);

    if (!parsedBody.success) {
        return NextResponse.json(
            {
                message: "Invalid avatar payload",
                errors: z.treeifyError(parsedBody.error),
            },
            { status: 400 }
        );
    }

    const newKey = parsedBody.data.profile_image;

    /* 1 Get old image */
    const { data: existing, error: fetchError } = await supabase
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

    const oldKey = existing?.profile_image;

    /* 2 Update DB first (safer) */
    const { error: updateError } = await supabase
        .from("instructors")
        .update({ profile_image: newKey })
        .eq("id", id);

    if (updateError) {
        return NextResponse.json(
            { message: updateError.message },
            { status: 500 }
        );
    }

    /* 3 Delete old image if different */
    if (oldKey && oldKey !== newKey) {
        await deleteR2Object(
            process.env.R2_PUBLIC_BUCKET_NAME!,
            oldKey
        )
    }

    return NextResponse.json({ success: true });
}
