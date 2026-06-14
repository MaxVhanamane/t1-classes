import type { z } from "zod";

import {
  createEnrollmentSchema,
  enrollmentTypeSchema,
  deactivationReasonSchema,
} from "../zod-schema/enrollments";

/* ========================================
   Base Shared Types
======================================== */

export type EnrollmentType = z.infer<typeof enrollmentTypeSchema>;

export type DeactivationReason = z.infer<typeof deactivationReasonSchema>;

export type RegistrationChannel = "online" | "offline";

export type TargetType = "course" | "batch";

/* ========================================
   RPC Rows
======================================== */

export type EnrollmentRpcRow = {
  enrollment_id: string;

  target_type: TargetType;

  enrollment_type: EnrollmentType;

  registration_channel: RegistrationChannel;

  is_active: boolean;

  notes: string | null;

  deactivation_reason: DeactivationReason | null;

  created_at: string;

  access_starts_at: string;

  access_ends_at: string | null;

  user_id: string;

  user_full_name: string;

  user_phone: string | null;

  course_id: string | null;

  course_title: string | null;

  course_slug: string | null;

  batch_id: string | null;

  batch_title: string | null;

  sale_price_at_creation: number | null;

  discount_amount: number | null;

  final_amount: number | null;

  paid_amount: number;

  pending_amount: number | null;

  overpaid_amount: number;

  superseded_count: number;

  fee_status: "no_fee_plan" | "pending" | "paid" | "overpaid" | null;

  total_count: number;
};

export type BatchSupabaseRow = {
  id: string;

  title: string;

  is_active: boolean;

  start_date: string | null;

  end_date: string | null;

  is_admission_open: boolean;

  batch_courses: {
    course: {
      id: string;

      title: string;
    };
  }[];
};

export type CourseSupabaseRow = {
  id: string;

  title: string;

  is_active: boolean;
};

/* ========================================
   UI Rows
======================================== */

export type EnrollmentRow = {
  id: string;

  target_type: TargetType;

  enrollment_type: EnrollmentType;

  registration_channel: RegistrationChannel;

  is_active: boolean;

  notes: string | null;

  deactivation_reason: DeactivationReason | null;

  created_at: string;

  access_starts_at: string;

  access_ends_at: string | null;

  user: {
    id: string;

    full_name: string;

    phone: string | null;
  };

  course: {
    id: string;

    title: string;

    slug: string;
  } | null;

  batch: {
    id: string;

    title: string;
  } | null;

  financialOverview: EnrollmentFinancialOverview | null;
};

/* ========================================
   Form Input (single source of truth)
======================================== */

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

/* ========================================
   Admin UI Options
======================================== */

export type BatchOption = {
  id: string;

  title: string;

  start_date: string | null;

  end_date: string | null;

  courses: {
    title: string;
  }[];

  is_active?: boolean;

  is_admission_open?: boolean;
};

export type CourseOption = {
  id: string;

  title: string;
};

/* ========================================
   Paginated Response
======================================== */

export type EnrollmentListResponse = {
  items: EnrollmentRow[];

  page: number;

  total: number;

  totalPages: number;

  pageSize: number;
};

/* ========================================
   Financial Overview
======================================== */

export type EnrollmentFinancialOverview = {
  sale_price_at_creation: number | null;

  discount_amount: number | null;

  final_amount: number | null;

  paid_amount: number;

  pending_amount: number | null;

  overpaid_amount: number;

  superseded_count: number;

  fee_status: "no_fee_plan" | "pending" | "paid" | "overpaid";
};
