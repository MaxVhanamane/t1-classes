// import { ExploreCourse } from "@/src/app/api/explore-batches/types"
// import { SupabaseClient } from "@supabase/supabase-js"

// /**
//  * Shape returned from batch_courses join
//  */
// type BatchCourseRow = {
//     batch_id: string
//     course: {
//         id: string
//         is_active: boolean
//     } | null
// }

// export async function getExploreCoursesService(
//     supabase: SupabaseClient,
//     userId?: string
// ): Promise<ExploreCourse[]> {
//     /* -----------------------------------------------------------
//      * 1️⃣ Fetch active courses
//      * --------------------------------------------------------- */
//     const { data: courses, error: coursesError } =
//         await supabase
//             .from("courses")
//             .select(`
//         id,
//         title,
//         slug,
//         description,
//         subtitle,
//         learning_outcomes,
//         target_audience,
//         thumbnail_image,
//         course_type,
//         class_level,
//         board,
//         target_exam,
//         subjects,
//         list_price,
//         sale_price,
//         languages
//       `)
//             .eq("is_active", true)

//     if (coursesError) {
//         console.error("Error fetching courses:", coursesError)
//         throw new Error("Failed to fetch courses")
//     }

//     if (!courses) return []

//     /* -----------------------------------------------------------
//      * 2️⃣ If no user → return all active courses
//      * --------------------------------------------------------- */
//     if (!userId) {
//         return courses
//     }

//     /* -----------------------------------------------------------
//      * 3️⃣ Fetch user enrollments
//      * --------------------------------------------------------- */
//     const {
//         data: enrollments,
//         error: enrollmentsError,
//     } = await supabase
//         .from("enrollments")
//         .select(`
//       target_type,
//       course_id,
//       batch_id
//     `)
//         .eq("user_id", userId)
//         .eq("is_active", true)
//         .in("status", ["ongoing", "paused"])

//     if (enrollmentsError) {
//         console.error(
//             "Error fetching enrollments:",
//             enrollmentsError
//         )
//         throw new Error("Failed to fetch enrollments")
//     }

//     const excludedCourseIds = new Set<string>()
//     const enrolledBatchIds: string[] = []

//     enrollments?.forEach((e) => {
//         if (e.target_type === "course" && e.course_id) {
//             excludedCourseIds.add(e.course_id)
//         }

//         if (e.target_type === "batch" && e.batch_id) {
//             enrolledBatchIds.push(e.batch_id)
//         }
//     })

//     /* -----------------------------------------------------------
//      * 4️⃣ Fetch courses inside enrolled batches
//      *    (ONLY active ones)
//      * --------------------------------------------------------- */
//     if (enrolledBatchIds.length > 0) {
//         const {
//             data: batchCourses,
//             error: batchCoursesError,
//         } = await supabase
//             .from("batch_courses")
//             .select(`
//         batch_id,
//         course:course_id (
//           id,
//           is_active
//         )
//       `)
//             .in("batch_id", enrolledBatchIds)

//         if (batchCoursesError) {
//             console.error(
//                 "Error fetching batch courses:",
//                 batchCoursesError
//             )
//             throw new Error(
//                 "Failed to fetch batch courses"
//             )
//         }

//         const rows =
//             batchCourses as unknown as BatchCourseRow[]

//         rows.forEach((row) => {
//             if (row.course?.is_active) {
//                 excludedCourseIds.add(row.course.id)
//             }
//         })
//     }

//     /* -----------------------------------------------------------
//      * 5️⃣ Return courses NOT already accessible to the user
//      * --------------------------------------------------------- */
//     return courses.filter(
//         (course) => !excludedCourseIds.has(course.id)
//     )
// }
