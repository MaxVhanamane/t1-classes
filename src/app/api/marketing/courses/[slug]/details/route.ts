import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("courses")
        .select(`
      id,
      title,
      slug,
      description,
      subtitle,
      learning_outcomes,
      target_audience,
      thumbnail_image,
      course_type,
      class_level,
      board,
      target_exam,
      subjects,
      sale_price,
      list_price,
      languages
    `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (error || !data) {
        return Response.json(
            { message: "Course not found" },
            { status: 404 }
        );
    }

    // Normalize response
    const response = {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        learning_outcomes: data.learning_outcomes,
        target_audience: data.target_audience,
        slug: data.slug,
        description: data.description,
        thumbnailImage: data.thumbnail_image,
        courseType: data.course_type,
        classLevel: data.class_level,
        board: data.board,
        targetExam: data.target_exam,
        subjects: data.subjects,
        list_price: data.list_price,
        sale_price: data.sale_price,
        languages: data.languages,
    };

    return Response.json(response, { status: 200 });
}
