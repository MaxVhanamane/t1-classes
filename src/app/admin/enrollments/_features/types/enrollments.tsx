export type EnrollmentSupabaseRow = {
  id: string;
  target_type: "course" | "batch";
  enrollment_type: "paid" | "scholarship" | "trial" | "internal";
  registration_channel: "online" | "offline";
  status: "ongoing" | "paused" | "completed" | "cancelled";
  is_active: boolean;
  notes: string | null;
  enrolled_at: string;
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

export type EnrollmentRow = {
  id: string;
  target_type: "course" | "batch";

  enrollment_type: "paid" | "scholarship" | "trial" | "internal";
  registration_channel: "online" | "offline";

  status: "ongoing" | "paused" | "completed" | "cancelled";
  is_active: boolean;

  notes: string | null;

  enrolled_at: string;
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

export type CreateEnrollmentInput = {
  user_id: string;

  target_type: "batch" | "course";
  batch_id?: string;
  course_id?: string;

  enrollment_type: "paid" | "scholarship" | "trial" | "internal";
  registration_channel: "online" | "offline";

  status: "ongoing" | "paused" | "completed" | "cancelled";
  is_active?: boolean;

  access_starts_at: string;
  access_ends_at?: string;

  notes?: string;
};

// BATCH OPTION (ADMIN UI)

export type BatchOption = {
  id: string;
  title: string;

  start_date: string | null;
  end_date: string | null;

  // many-to-many
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
