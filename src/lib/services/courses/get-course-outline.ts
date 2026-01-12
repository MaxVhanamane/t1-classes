"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getCourseAccess } from "./course-access";
import {
    CourseOutline,
    CourseChapter,
    CourseTopic,
    CourseUnitOutline,
    PracticeSetOutline,
} from "@/src/types/course-outline.types";


export async function getCourseOutline(
    courseId: string
): Promise<CourseOutline> {
    const supabase = await createServerSupabaseClient();

    /* -----------------------------------------------------------
     * 1. Determine access once
     * --------------------------------------------------------- */
    const access = await getCourseAccess(courseId);

    const hasAccess = access.hasAccess;

    /* -----------------------------------------------------------
     * 2. Fetch course structure (chapters + topics)
     * --------------------------------------------------------- */
    const { data: structure, error: structureError } = await supabase
        .from("course_structure")
        .select("id, title, parent_id, structure_type, sort_order")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("sort_order");


    if (structureError) {
        throw new Error(structureError.message);
    }

    /* -----------------------------------------------------------
     * 3. Fetch course units (metadata only)
     * --------------------------------------------------------- */
    const { data: units, error: unitsError } = await supabase
        .from("course_units")
        .select(
            "id, title, unit_type, duration_minutes, is_free_preview, structure_id"
        )
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("sort_order");


    if (unitsError) {
        throw new Error(unitsError.message);
    }

    /* -----------------------------------------------------------
     * 4. Fetch practice sets (titles only)
     * --------------------------------------------------------- */
    const { data: practiceSets, error: practiceError } = await supabase
        .from("practice_sets")
        .select("id, title, topic_id")
        .eq("is_published", true)
        .order("sort_order");

    if (practiceError) {
        throw new Error(practiceError.message);
    }


    /* -----------------------------------------------------------
     * 5. Normalize into tree
     * --------------------------------------------------------- */

    const chapters = structure.filter((s) => s.structure_type === "chapter");
    const topics = structure.filter((s) => s.structure_type === "topic");

    const outlineChapters: CourseChapter[] = chapters.map((chapter) => {
        const chapterTopics = topics.filter(
            (t) => t.parent_id === chapter.id
        );

        const mappedTopics: CourseTopic[] = chapterTopics.map((topic) => {
            const topicUnits = units
                .filter((u) => u.structure_id === topic.id)
                .map<CourseUnitOutline>((u) => ({
                    id: u.id,
                    title: u.title,
                    unitType: u.unit_type,
                    durationMinutes: u.duration_minutes,
                    isFreePreview: hasAccess ? false : u.is_free_preview,
                    access:
                        hasAccess || u.is_free_preview ? "accessible" : "locked",
                }));

            const topicPracticeSets = practiceSets
                .filter((ps) => ps.topic_id === topic.id)
                .map<PracticeSetOutline>((ps) => ({
                    id: ps.id,
                    title: ps.title,
                    access: hasAccess ? "accessible" : "locked",
                }));

            return {
                id: topic.id,
                title: topic.title,
                units: topicUnits,
                practiceSets: topicPracticeSets,
            };
        });

        return {
            id: chapter.id,
            title: chapter.title,
            topics: mappedTopics,
        };
    });

    return {
        courseId,
        hasAccess,
        chapters: outlineChapters,
    };
}
