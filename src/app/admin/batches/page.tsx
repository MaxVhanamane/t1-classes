import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { BatchesClient } from "./_features/components/batches-client-wrapper";

import { BatchListItem, CourseSelectItem } from "./_features/types/types";

async function getCourses(): Promise<CourseSelectItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, title, is_active")
    .order("title")
    .overrideTypes<
      CourseSelectItem[],
      {
        merge: false;
      }
    >();

  if (error) {
    throw new Error("Failed to load courses");
  }

  return data;
}

async function getBatches(): Promise<BatchListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("batches")
    .select(
      `
        id,
        title,
        slug,
        subtitle,
        description,
        sale_price,
        list_price,
        thumbnail_image,
        subjects,
        class_level,
        target_exam,
        mode,
        location,
        languages,
        is_active,
        is_admission_open,
        start_date,
        end_date,
        capacity,
        learning_outcomes,
        target_audience,
        location,
        address,
        category,
        board,

        courses:batch_courses (
          course:courses (
            id,
            title
          )
        ),

        batch_instructors (
          instructor:users (
            id,
            full_name
          )
        )
        `,
    )
    .order("created_at", {
      ascending: false,
    })
    .overrideTypes<
      (BatchListItem & {
        batch_instructors?: {
          instructor: {
            id: string;
            full_name: string;
          } | null;
        }[];
      })[],
      {
        merge: false;
      }
    >();

  if (error) {
    console.error(error);

    throw new Error("Failed to load batches");
  }

  if (!data) {
    return [];
  }

  return data.map((batch) => {
    const instructors =
      batch.batch_instructors?.flatMap((bi) =>
        bi.instructor ? [bi.instructor] : [],
      ) ?? [];

    return {
      ...batch,

      instructors,
    };
  });
}

export default async function AdminBatchesPage() {
  const [batches, courses] = await Promise.all([getBatches(), getCourses()]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <BatchesClient batches={batches} courses={courses} />
    </div>
  );
}
