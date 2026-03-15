import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";

type InstructorOption = {
    id: string;
    full_name: string;
};

export async function GET() {
    try {
        // Ensure admin access
        const staff = await getCurrentStaff();

        if (!staff || staff.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 403 },
            );
        }

        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("instructors")
            .select("id, full_name")
            .eq("is_active", true)
            .order("full_name", { ascending: true });

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json(data satisfies InstructorOption[]);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to load instructors" },
            { status: 500 },
        );
    }
}
