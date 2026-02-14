"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff";
import { SectionTemplate } from "../../types/section-template.types";



export async function getSectionTemplates(): Promise<SectionTemplate[]> {
    await getCurrentStaff(); // admin / teacher only

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("test_section_templates")
        .select(`
      id,
      name,
      description,
      answer_mode,
      max_selections,
      default_full_marks,
      default_negative_marks,
      default_partial_marks
    `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        answerMode: t.answer_mode as SectionTemplate["answerMode"],
        maxSelections: t.max_selections,
        defaultFullMarks: Number(t.default_full_marks),
        defaultNegativeMarks: Number(t.default_negative_marks),
        defaultPartialMarks:
            t.default_partial_marks as SectionTemplate["defaultPartialMarks"],
    }));
}
