import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createServerSupabaseClient,
} from "@/src/lib/supabase/supabase-server";

import {
    requireAdminApiRoute,
} from "@/src/lib/auth/require-role-api-route";

import type {
    EnrollmentListResponse,
    EnrollmentRow,
    EnrollmentRpcRow,
} from "@/src/app/admin/enrollments/_features/types/enrollments.types";

const PAGE_SIZE = 20;

export async function GET(
    request: NextRequest,
) {
    try {
        /* ------------------------------------------ */
        /* Auth                                       */
        /* ------------------------------------------ */

        const auth =
            await requireAdminApiRoute();

        if (!auth.authorized) {
            return auth.response;
        }

        /* ------------------------------------------ */
        /* Query params                               */
        /* ------------------------------------------ */

        const searchParams =
            request.nextUrl.searchParams;

        const search =
            searchParams
                .get("search")
                ?.trim() ?? "";

        const active =
            searchParams.get(
                "active",
            ) ?? "all";

        const targetType =
            searchParams.get(
                "targetType",
            ) ?? "all";

        const enrollmentType =
            searchParams.get(
                "enrollmentType",
            ) ?? "all";

        const registrationChannel =
            searchParams.get(
                "registrationChannel",
            ) ?? "all";

        const feeStatus =
            searchParams.get(
                "feeStatus",
            ) ?? "all";

        const feePlanRevision =
            searchParams.get(
                "feePlanRevision",
            ) ?? "all";

        const access =
            searchParams.get(
                "access",
            ) ?? "all";

        const batchId =
            searchParams.get(
                "batchId",
            ) ?? null;

        const courseId =
            searchParams.get(
                "courseId",
            ) ?? null;

        if (
            batchId &&
            courseId
        ) {
            return NextResponse.json(
                {
                    message:
                        "Cannot filter by both batch and course.",
                },
                {
                    status: 400,
                },
            );
        }

        const normalizedTargetType =
            batchId
                ? "batch"
                : courseId
                    ? "course"
                    : targetType;

        if (
            targetType !==
            "all" &&
            normalizedTargetType !==
            targetType
        ) {
            return NextResponse.json(
                {
                    message:
                        "Target type does not match selected filters.",
                },
                {
                    status: 400,
                },
            );
        }

        const page =
            Math.max(
                Number(
                    searchParams.get(
                        "page",
                    ) ?? "1",
                ),
                1,
            );

        /* ------------------------------------------ */
        /* Supabase                                   */
        /* ------------------------------------------ */

        const supabase =
            await createServerSupabaseClient();

        /* ------------------------------------------ */
        /* RPC                                        */
        /* ------------------------------------------ */

        const rpcResponse =
            await supabase.rpc(
                "get_admin_enrollments",
                {
                    p_search:
                        search,

                    p_active:
                        active,

                    p_target_type:
                        normalizedTargetType,

                    p_enrollment_type:
                        enrollmentType,

                    p_registration_channel:
                        registrationChannel,

                    p_fee_status:
                        feeStatus,

                    p_fee_plan_revision:
                        feePlanRevision,

                    p_access:
                        access,

                    p_batch_id:
                        batchId,

                    p_course_id:
                        courseId,

                    p_page:
                        page,

                    p_page_size:
                        PAGE_SIZE,
                },
            );

        if (
            rpcResponse.error
        ) {
            throw new Error(
                rpcResponse.error
                    .message,
            );
        }

        const rows =
            (rpcResponse.data ??
                []) as EnrollmentRpcRow[];

        /* ------------------------------------------ */
        /* Map                                        */
        /* ------------------------------------------ */

        const items: EnrollmentRow[] =
            rows.map(
                (
                    e,
                ): EnrollmentRow => ({
                    id: e.enrollment_id,

                    target_type:
                        e.target_type,

                    enrollment_type:
                        e.enrollment_type,

                    registration_channel:
                        e.registration_channel,

                    is_active:
                        e.is_active,

                    notes:
                        e.notes,

                    deactivation_reason:
                        e.deactivation_reason,

                    created_at:
                        e.created_at,

                    access_starts_at:
                        e.access_starts_at,

                    access_ends_at:
                        e.access_ends_at,

                    user: {
                        id: e.user_id,

                        full_name:
                            e.user_full_name,

                        phone:
                            e.user_phone,
                    },

                    course:
                        e.course_id
                            ? {
                                id: e.course_id,

                                title:
                                    e.course_title!,

                                slug:
                                    e.course_slug!,
                            }
                            : null,

                    batch:
                        e.batch_id
                            ? {
                                id: e.batch_id,

                                title:
                                    e.batch_title!,


                            }
                            : null,

                    financialOverview:
                        e.fee_status
                            ? {
                                sale_price_at_creation:
                                    e.sale_price_at_creation,

                                discount_amount:
                                    e.discount_amount,

                                final_amount:
                                    e.final_amount,

                                paid_amount:
                                    e.paid_amount ??
                                    0,

                                pending_amount:
                                    e.pending_amount,

                                overpaid_amount:
                                    e.overpaid_amount ??
                                    0,

                                superseded_count:
                                    e.superseded_count ??
                                    0,

                                fee_status:
                                    e.fee_status,
                            }
                            : null,
                }),
            );

        /* ------------------------------------------ */
        /* Response                                   */
        /* ------------------------------------------ */

        const total =
            rows[0]
                ?.total_count ??
            0;

        return NextResponse.json<EnrollmentListResponse>(
            {
                items,

                page,

                total,

                totalPages:
                    Math.ceil(
                        total /
                        PAGE_SIZE,
                    ),

                pageSize:
                    PAGE_SIZE,
            },
        );
    } catch (
    error
    ) {
        console.error(
            "[ADMIN_ENROLLMENTS_GET_ERROR]",
            error,
        );

        return NextResponse.json(
            {
                message:
                    "Failed to load enrollments",
            },
            {
                status: 500,
            },
        );
    }
}


















// import { NextRequest, NextResponse } from "next/server";

// import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

// import { requireAdminApiRoute } from "@/src/lib/auth/require-role-api-route";

// import type {
//     EnrollmentListResponse,
//     EnrollmentRow,
//     EnrollmentSupabaseRow,
// } from "@/src/app/admin/enrollments/_features/types/enrollments";

// const PAGE_SIZE = 20;

// export async function GET(
//     request: NextRequest,
// ) {
//     try {
//         /* ------------------------------------------ */
//         /* Auth                                       */
//         /* ------------------------------------------ */

//         const auth =
//             await requireAdminApiRoute();

//         if (!auth.authorized) {
//             return auth.response;
//         }

//         /* ------------------------------------------ */
//         /* Query params                               */
//         /* ------------------------------------------ */

//         const searchParams =
//             request.nextUrl.searchParams;

//         const search =
//             searchParams
//                 .get("search")
//                 ?.trim() ?? "";

//         const active =
//             searchParams.get(
//                 "active",
//             ) ?? "all";

//         const targetType =
//             searchParams.get(
//                 "targetType",
//             ) ?? "all";

//         const enrollmentType =
//             searchParams.get(
//                 "enrollmentType",
//             ) ?? "all";

//         const feeStatus =
//             searchParams.get("feeStatus") ?? "all";

//         const feePlanRevision =
//             searchParams.get("feePlanRevision") ?? "all";

//         const access =
//             searchParams.get("access") ?? "all";

//         const registrationChannel =
//             searchParams.get(
//                 "registrationChannel",
//             ) ?? "all";

//         const batchId =
//             searchParams.get(
//                 "batchId",
//             ) ?? null;

//         const courseId =
//             searchParams.get(
//                 "courseId",
//             ) ?? null;

//         if (batchId && courseId) {
//             return NextResponse.json(
//                 {
//                     message:
//                         "Cannot filter by both batch and course.",
//                 },
//                 {
//                     status: 400,
//                 },
//             );
//         }


//         const normalizedTargetType =
//             batchId
//                 ? "batch"
//                 : courseId
//                     ? "course"
//                     : targetType;

//         if (
//             targetType !== "all" &&
//             normalizedTargetType !== targetType
//         ) {
//             return NextResponse.json(
//                 {
//                     message:
//                         "Target type does not match selected filters.",
//                 },
//                 {
//                     status: 400,
//                 },
//             );
//         }

//         const page = Math.max(
//             Number(
//                 searchParams.get(
//                     "page",
//                 ) ?? "1",
//             ),
//             1,
//         );

//         const from =
//             (page - 1) *
//             PAGE_SIZE;

//         const to =
//             from +
//             PAGE_SIZE -
//             1;

//         /* ------------------------------------------ */
//         /* Supabase                                   */
//         /* ------------------------------------------ */

//         const supabase =
//             await createServerSupabaseClient();

//         /* ------------------------------------------ */
//         /* Build queries                              */
//         /* ------------------------------------------ */

//         let countQuery =
//             supabase
//                 .from(
//                     "enrollments",
//                 )
//                 .select("id", {
//                     count: "exact",
//                     head: true,
//                 });

//         let dataQuery = supabase
//             .from("enrollments")
//             .select(`
//     id,
//     target_type,
//     enrollment_type,
//     registration_channel,
//     is_active,
//     notes,
//     deactivation_reason,
//     created_at,
//     access_starts_at,
//     access_ends_at,

//     user:users!enrollments_user_id_fkey (
//       id,
//       full_name,
//       phone
//     ),

//     course:courses (
//       id,
//       title,
//       slug
//     ),

//     batch:batches (
//       id,
//       title,
//       batch_courses (
//         course:courses (
//           id,
//           title
//         )
//       )
//     ),

//     financials:enrollment_financial_summary (
//       sale_price_at_creation,
//       discount_amount,
//       final_amount,
//       paid_amount,
//       pending_amount,
//       overpaid_amount,
//       superseded_count,
//       fee_status
//     )
//   `);

//         /* ------------------------------------------ */
//         /* Search                                     */
//         /* ------------------------------------------ */

//         if (search) {
//             const {
//                 data: users,
//                 error:
//                 usersError,
//             } = await supabase
//                 .from("users")
//                 .select("id")
//                 .or(
//                     `full_name.ilike.%${search}%,phone.ilike.%${search}%`,
//                 );

//             if (usersError) {
//                 throw new Error(
//                     usersError.message,
//                 );
//             }

//             const userIds =
//                 users?.map(
//                     (user) =>
//                         user.id,
//                 ) ?? [];

//             if (
//                 userIds.length ===
//                 0
//             ) {
//                 return NextResponse.json<EnrollmentListResponse>(
//                     {
//                         items: [],
//                         page,
//                         total: 0,
//                         totalPages: 0,
//                         pageSize:
//                             PAGE_SIZE,
//                     },
//                 );
//             }

//             countQuery =
//                 countQuery.in(
//                     "user_id",
//                     userIds,
//                 );

//             dataQuery =
//                 dataQuery.in(
//                     "user_id",
//                     userIds,
//                 );
//         }

//         if (feeStatus !== "all") {
//             dataQuery = dataQuery.eq(
//                 "financials.fee_status",
//                 feeStatus,
//             );

//             countQuery = countQuery.eq(
//                 "financials.fee_status",
//                 feeStatus,
//             );
//         }

//         if (feePlanRevision === "revised") {
//             dataQuery = dataQuery.gt(
//                 "financials.superseded_count",
//                 0,
//             );

//             countQuery = countQuery.gt(
//                 "financials.superseded_count",
//                 0,
//             );
//         }

//         if (feePlanRevision === "never") {
//             dataQuery = dataQuery.eq(
//                 "financials.superseded_count",
//                 0,
//             );

//             countQuery = countQuery.eq(
//                 "financials.superseded_count",
//                 0,
//             );
//         }
//         const now = new Date().toISOString();

//         if (access === "ongoing") {
//             dataQuery = dataQuery
//                 .lte("access_starts_at", now)
//                 .or(
//                     `access_ends_at.is.null,access_ends_at.gte.${now}`,
//                 );

//             countQuery = countQuery
//                 .lte("access_starts_at", now)
//                 .or(
//                     `access_ends_at.is.null,access_ends_at.gte.${now}`,
//                 );
//         }

//         if (access === "upcoming") {
//             dataQuery =
//                 dataQuery.gt(
//                     "access_starts_at",
//                     now,
//                 );

//             countQuery =
//                 countQuery.gt(
//                     "access_starts_at",
//                     now,
//                 );
//         }

//         if (access === "ended") {
//             dataQuery =
//                 dataQuery.lt(
//                     "access_ends_at",
//                     now,
//                 );

//             countQuery =
//                 countQuery.lt(
//                     "access_ends_at",
//                     now,
//                 );
//         }

//         /* ------------------------------------------ */
//         /* Active                                     */
//         /* ------------------------------------------ */

//         if (
//             active !== "all"
//         ) {
//             const value =
//                 active ===
//                 "active";

//             countQuery =
//                 countQuery.eq(
//                     "is_active",
//                     value,
//                 );

//             dataQuery =
//                 dataQuery.eq(
//                     "is_active",
//                     value,
//                 );
//         }

//         /* ------------------------------------------ */
//         /* Target type                                */
//         /* ------------------------------------------ */

//         if (normalizedTargetType !== "all") {
//             countQuery =
//                 countQuery.eq(
//                     "target_type",
//                     normalizedTargetType,
//                 );

//             dataQuery =
//                 dataQuery.eq(
//                     "target_type",
//                     normalizedTargetType,
//                 );
//         }

//         /* ------------------------------------------ */
//         /* Enrollment type                            */
//         /* ------------------------------------------ */

//         if (
//             enrollmentType !==
//             "all"
//         ) {
//             countQuery =
//                 countQuery.eq(
//                     "enrollment_type",
//                     enrollmentType,
//                 );

//             dataQuery =
//                 dataQuery.eq(
//                     "enrollment_type",
//                     enrollmentType,
//                 );
//         }

//         /* ------------------------------------------ */
//         /* Registration channel                       */
//         /* ------------------------------------------ */

//         if (
//             registrationChannel !==
//             "all"
//         ) {
//             countQuery =
//                 countQuery.eq(
//                     "registration_channel",
//                     registrationChannel,
//                 );

//             dataQuery =
//                 dataQuery.eq(
//                     "registration_channel",
//                     registrationChannel,
//                 );
//         }

//         /* ------------------------------------------ */
//         /* Batch                                      */
//         /* ------------------------------------------ */

//         if (
//             normalizedTargetType === "batch" &&
//             batchId
//         ) {
//             countQuery =
//                 countQuery.eq(
//                     "batch_id",
//                     batchId,
//                 );

//             dataQuery =
//                 dataQuery.eq(
//                     "batch_id",
//                     batchId,
//                 );
//         }

//         /* ------------------------------------------ */
//         /* Course                                     */
//         /* ------------------------------------------ */

//         if (
//             normalizedTargetType === "course" &&
//             courseId
//         ) {
//             countQuery =
//                 countQuery.eq(
//                     "course_id",
//                     courseId,
//                 );

//             dataQuery =
//                 dataQuery.eq(
//                     "course_id",
//                     courseId,
//                 );
//         }
//         /* ------------------------------------------ */
//         /* Execute                                    */
//         /* ------------------------------------------ */

//         const [
//             countResult,
//             dataResult,
//         ] = await Promise.all([
//             countQuery,

//             dataQuery
//                 .order(
//                     "created_at",
//                     {
//                         ascending: false,
//                     },
//                 )
//                 .range(
//                     from,
//                     to,
//                 )
//                 .overrideTypes<
//                     EnrollmentSupabaseRow[],
//                     {
//                         merge: false;
//                     }
//                 >(),
//         ]);

//         if (
//             countResult.error
//         ) {
//             throw new Error(
//                 countResult
//                     .error.message,
//             );
//         }

//         if (
//             dataResult.error
//         ) {
//             throw new Error(
//                 dataResult
//                     .error.message,
//             );
//         }

//         /* ------------------------------------------ */
//         /* Map                                        */
//         /* ------------------------------------------ */

//         const items: EnrollmentRow[] =
//             (
//                 dataResult.data as EnrollmentSupabaseRow[] | null
//             )?.map(
//                 (e) => ({
//                     id: e.id,

//                     target_type:
//                         e.target_type,

//                     enrollment_type:
//                         e.enrollment_type,

//                     registration_channel:
//                         e.registration_channel,

//                     is_active:
//                         e.is_active,

//                     notes: e.notes,

//                     deactivation_reason:
//                         e.deactivation_reason,

//                     created_at:
//                         e.created_at,

//                     access_starts_at:
//                         e.access_starts_at,

//                     access_ends_at:
//                         e.access_ends_at,

//                     user: e.user,

//                     course:
//                         e.course,

//                     batch: e.batch
//                         ? {
//                             id: e.batch.id,

//                             title:
//                                 e.batch
//                                     .title,

//                             courses:
//                                 e.batch.batch_courses.map(
//                                     (
//                                         bc,
//                                     ) => ({
//                                         id: bc
//                                             .course
//                                             .id,

//                                         title:
//                                             bc
//                                                 .course
//                                                 .title,
//                                     }),
//                                 ),
//                         }
//                         : null,
//                     financials: e.financials
//                         ? {
//                             sale_price_at_creation:
//                                 e.financials.sale_price_at_creation !== null
//                                     ? Number(e.financials.sale_price_at_creation)
//                                     : null,

//                             discount_amount:
//                                 e.financials.discount_amount !== null
//                                     ? Number(e.financials.discount_amount)
//                                     : null,

//                             final_amount:
//                                 e.financials.final_amount !== null
//                                     ? Number(e.financials.final_amount)
//                                     : null,

//                             paid_amount: Number(
//                                 e.financials.paid_amount,
//                             ),

//                             pending_amount:
//                                 e.financials.pending_amount !== null
//                                     ? Number(e.financials.pending_amount)
//                                     : null,

//                             overpaid_amount: Number(
//                                 e.financials.overpaid_amount,
//                             ),

//                             superseded_count: Number(
//                                 e.financials.superseded_count,
//                             ),

//                             fee_status:
//                                 e.financials.fee_status,
//                         }
//                         : null,
//                 }),
//             ) ?? [];

//         /* ------------------------------------------ */
//         /* Response                                   */
//         /* ------------------------------------------ */

//         const total =
//             countResult.count ??
//             0;

//         return NextResponse.json<EnrollmentListResponse>(
//             {
//                 items,

//                 page,

//                 total,

//                 totalPages:
//                     Math.ceil(
//                         total /
//                         PAGE_SIZE,
//                     ),

//                 pageSize:
//                     PAGE_SIZE,
//             },
//         );
//     } catch (error) {
//         console.error(
//             "[ADMIN_ENROLLMENTS_GET_ERROR]",
//             error,
//         );

//         return NextResponse.json(
//             {
//                 message:
//                     "Failed to load enrollments",
//             },
//             {
//                 status: 500,
//             },
//         );
//     }
// }
