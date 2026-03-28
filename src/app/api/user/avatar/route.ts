import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";
import { getAuth } from "@/src/lib/auth/get-auth";

const R2_PUBLIC_BUCKET_NAME = process.env.R2_PUBLIC_BUCKET_NAME!;

type Body = {
    profile_image: string;
};

/* ------------------------------------------------ */
/* UPDATE AVATAR                                    */
/* ------------------------------------------------ */

export async function PUT(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const user = await getAuth();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = (await req.json().catch(() => null)) as Body | null;

        if (!body?.profile_image) {
            return NextResponse.json(
                { message: "Invalid body" },
                { status: 400 }
            );
        }

        /* Ensure uploaded key belongs to this user */

        if (!body.profile_image.startsWith(`users/${user.userId}/`)) {
            return NextResponse.json(
                { message: "Invalid avatar key" },
                { status: 403 }
            );
        }

        /* Update DB using RPC */

        const { error } = await supabase.rpc("update_profile_image", {
            url: body.profile_image,
        });

        if (error) {
            console.error("[AVATAR_UPDATE_ERROR]", error);

            return NextResponse.json(
                { message: "Failed to update avatar" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[AVATAR_ROUTE_ERROR]", error);

        return NextResponse.json(
            { message: "Unexpected error" },
            { status: 500 }
        );
    }
}

/* ------------------------------------------------ */
/* DELETE AVATAR                                    */
/* ------------------------------------------------ */

export async function DELETE() {
    try {
        const supabase = await createServerSupabaseClient();
        const user = await getAuth();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        /* Get avatar key before deleting */

        const { data } = await supabase
            .from("users")
            .select("profile_image")
            .eq("id", user.userId)
            .maybeSingle();

        const key = data?.profile_image;

        /* Remove avatar from DB */

        const { error } = await supabase.rpc("remove_avatar");

        if (error) {
            console.error("[AVATAR_DELETE_ERROR]", error);

            return NextResponse.json(
                { message: "Failed to remove avatar" },
                { status: 500 }
            );
        }

        /* Remove file from R2 */

        if (key) {
            await deleteR2Object(R2_PUBLIC_BUCKET_NAME, key);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[AVATAR_DELETE_ROUTE_ERROR]", error);

        return NextResponse.json(
            { message: "Unexpected error" },
            { status: 500 }
        );
    }
}
