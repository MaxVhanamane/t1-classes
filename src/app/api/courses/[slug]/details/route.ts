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
      thumbnail_image,
      course_type,
      class_level,
      board,
      target_exam,
      subjects,
      price
    `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (error || !data) {
        console.log("eserver errore", error)
        return Response.json(
            { message: "Course not found" },
            { status: 404 }
        );
    }

    // Normalize response
    const response = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnailImage: data.thumbnail_image,
        courseType: data.course_type,
        classLevel: data.class_level,
        board: data.board,
        targetExam: data.target_exam,
        subjects: data.subjects,
        price: data.price,
    };

    return Response.json(response, { status: 200 });
}
