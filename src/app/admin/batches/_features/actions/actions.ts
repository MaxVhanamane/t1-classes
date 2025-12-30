"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { batchSchema } from "../zod-schema/schema";
import { revalidatePath } from "next/cache";



export async function createBatch(input: unknown) {
    const data = batchSchema.parse(input);
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("batches").insert({
        ...data,
        created_by: user!.id,
    });

    if (error) throw error;

    revalidatePath("/admin/batches");
}

export async function updateBatch(
    id: string,
    input: unknown
) {
    const data = batchSchema.partial().parse(input);
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("batches")
        .update({
            ...data,
            updated_by: user!.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/batches");
}
