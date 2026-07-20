"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";

import { ServerActionResponse } from "@/src/types/server-action";

export async function addTestSectionFromTemplate(
    testId: string,
    templateId: string,
    subjectLabel: string,
): Promise<ServerActionResponse> {
    // redirect() throws internally; calling inside try/catch would prevent the redirect
    const staff = await requireStaffServerOnly();

    try {
        const supabase = await createServerSupabaseClient();

        /* -------------------------------------------- */
        /* Validate Subject */
        /* -------------------------------------------- */

        const cleanSubject = subjectLabel?.trim();

        if (!cleanSubject || cleanSubject.length < 2) {
            return {
                error: "Invalid subject label",
            };
        }

        /* -------------------------------------------- */
        /* Fetch template + test lock in parallel */
        /* -------------------------------------------- */

        const [templateRes, testRes] = await Promise.all([
            supabase
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
                .eq("id", templateId)
                .eq("is_active", true)
                .single(),

            supabase
                .from("tests")
                .select(`
          is_locked,
          created_by
        `)
                .eq("id", testId)
                .single(),
        ]);

        const template = templateRes.data;

        const test = testRes.data;

        if (templateRes.error || !template) {
            return {
                error: "Template not found",
            };
        }

        if (testRes.error || !test) {
            return {
                error: "Test not found",
            };
        }

        /* -------------------------------------------- */
        /* Ownership check */
        /* -------------------------------------------- */

        if (
            staff.role === "teacher" &&
            test.created_by !== staff.userId
        ) {
            return {
                error:
                    "You are not authorized to modify this test",
            };
        }

        /* -------------------------------------------- */
        /* Lock check */
        /* -------------------------------------------- */

        if (test.is_locked) {
            return {
                error:
                    "This test is locked and cannot be modified",
            };
        }

        /* -------------------------------------------- */
        /* Compute next sort_order */
        /* -------------------------------------------- */

        const {
            data: lastSection,
            error: sortError,
        } = await supabase
            .from("test_sections")
            .select("sort_order")
            .eq("test_id", testId)
            .order("sort_order", {
                ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (sortError) {
            console.error(
                "[SECTION_SORT_ERROR]",
                sortError,
            );

            return {
                error:
                    "Failed to determine section order",
            };
        }

        const nextSortOrder =
            (lastSection?.sort_order ?? 0) + 1;

        /* -------------------------------------------- */
        /* Insert section */
        /* -------------------------------------------- */

        const { error: insertError } =
            await supabase
                .from("test_sections")
                .insert({
                    test_id: testId,

                    title: template.name,

                    description:
                        template.description,

                    answer_mode:
                        template.answer_mode,

                    max_selections:
                        template.max_selections,

                    full_marks:
                        template.default_full_marks,

                    negative_marks:
                        template.default_negative_marks,

                    partial_marks:
                        template.default_partial_marks,

                    sort_order: nextSortOrder,

                    subject_label: cleanSubject,
                });

        if (insertError) {
            console.error(
                "[ADD_TEST_SECTION_ERROR]",
                insertError,
            );

            return {
                error:
                    "Failed to add section. Please try again.",
            };
        }


    } catch (error) {
        console.error(
            "[ADD_TEST_SECTION_FATAL]",
            error,
        );

        return {
            error:
                "Something went wrong. Please try again.",
        };
    }
}
