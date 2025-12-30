"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentUser } from "@/src/lib/helper-functions/getCurrentUser";

export async function getPdfSignedUrl(
    filePath: string
): Promise<string> {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Optional: add enrollment / role checks here later

    const { data, error } = await supabase.storage
        .from("course-pdfs")
        .createSignedUrl(filePath, 60 * 5); // 5 minutes

    if (error || !data?.signedUrl) {
        throw new Error("Failed to generate signed URL");
    }

    return data.signedUrl;
}
