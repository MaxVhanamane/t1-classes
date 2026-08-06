// app/api/uploads/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAnyUserApiRoute } from "@/src/lib/auth/claims/require-role-api-route";
import { deleteR2Object } from "@/src/lib/r2/deleteObject";

export async function POST(req: NextRequest) {
    try {
        const auth = await requireAnyUserApiRoute();
        if (!auth.authorized) return auth.response;

        // Ensure only instructors/admins can delete
        if (auth.user.role === "student") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { key, bucket } = body;

        if (!key || !bucket) {
            return NextResponse.json({ message: "Missing key or bucket" }, { status: 400 });
        }

        await deleteR2Object(bucket, key);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[IMAGE_DELETE_API]", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
