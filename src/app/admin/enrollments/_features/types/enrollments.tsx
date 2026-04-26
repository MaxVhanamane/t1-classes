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
   Supabase Query Rows
======================================== */

export type EnrollmentSupabaseRow = {
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
  } | null;

  course: {
    id: string;
    title: string;
    slug: string;
  } | null;

  batch: {
    id: string;
    title: string;

    batch_courses: {
      course: {
        id: string;
        title: string;
      };
    }[];
  } | null;
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
  } | null;

  course: {
    id: string;
    title: string;
    slug: string;
  } | null;

  batch: {
    id: string;
    title: string;

    courses: {
      id: string;
      title: string;
    }[];
  } | null;
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

  course: {
    title: string;
  }[];

  is_active?: boolean;

  is_admission_open?: boolean;
};

export type CourseOption = {
  id: string;
  title: string;
};
