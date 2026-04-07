import "server-only";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getCourseBySlug(slug: string, supabase: SupabaseClient) {
  const decodedSlug = decodeURIComponent(slug);

  const { data, error } = await supabase
    .from("courses")
    .select(
      `
            id,
            title,
            slug,
            description,
            subtitle,
            learning_outcomes,
            target_audience,
            thumbnail_image,
            category,
            class_level,
            board,
            target_exam,
            subjects,
            sale_price,
            list_price,
            languages
        `,
    )
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Normalize response
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    learning_outcomes: data.learning_outcomes,
    target_audience: data.target_audience,
    slug: data.slug,
    description: data.description,
    thumbnailImage: data.thumbnail_image,
    category: data.category,
    classLevel: data.class_level,
    board: data.board,
    targetExam: data.target_exam,
    subjects: data.subjects,
    list_price: data.list_price,
    sale_price: data.sale_price,
    languages: data.languages,
  };
}
