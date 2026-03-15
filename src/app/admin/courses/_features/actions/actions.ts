// app/admin/courses/actions.ts

'use server'

import { revalidatePath } from "next/cache"


import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server"
import { CourseFormValueTypes } from "../types/course.types"
import { getCurrentStaff } from "@/src/lib/helper-functions/getCurrentStaff"



export type Course = {
    id: string
    title: string
    slug: string
    description: {
        [x: string]: unknown;
    } | null | undefined;
    thumbnail_image: string | null
    course_type: CourseFormValueTypes
    class_level: number | null
    board: string | null
    target_exam: string | null
    subjects: string[] | null
    price: number | null
    is_active: boolean
    created_at: string
}

export async function getCourses(): Promise<Course[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from('courses')
        .select(
            `id,
       title,
       slug,
       description,
       thumbnail_image,
       course_type,
       class_level,
       board,
       target_exam,
       subjects,
       price,
       is_active,
       created_at`
        )
        .order('created_at', { ascending: false })

    if (error) {

        throw new Error('Failed to load courses')
    }

    return data ?? []
}

export async function createCourse(input: {
    title: string
    description?: string
    course_type: string
    class_level?: number
    board?: string
    target_exam?: string
    subjects?: string[]
    price?: number
    is_active: boolean
}) {
    const supabase = await createServerSupabaseClient()

    const auth = await getCurrentStaff()
    const slug = input.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')

    const { error } = await supabase.from('courses').insert({
        ...input,
        slug,
        created_by: auth.id,
    })

    if (error) {
        throw new Error('Failed to create course')
    }
    revalidatePath("/admin/courses");
}

export async function updateCourse(
    courseId: string,
    updates: Partial<{
        title: string
        description: string
        course_type: string
        class_level: number
        board: string
        target_exam: string
        subjects: string[]
        price: number
        is_active: boolean
    }>
) {
    const supabase = await createServerSupabaseClient()

    const auth = await getCurrentStaff()



    const { error } = await supabase
        .from('courses')
        .update({
            ...updates,
            updated_by: auth.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', courseId)

    if (error) {

        throw new Error('Failed to update course')
    }
    revalidatePath("/admin/courses");
}
