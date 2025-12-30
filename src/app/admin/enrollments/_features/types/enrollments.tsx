export type EnrollmentRow = {
  id: string;
  target_type: "course" | "batch";
  enrollment_type: "paid" | "scholarship" | "trial" | "internal";
  status: "ongoing" | "paused" | "completed" | "cancelled";
  is_active: boolean;
  notes: string | null;
  registration_channel: "online" | "offline";
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
    name: string;
    status: string;
    course: {
      title: string;
    } | null;
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

export type BatchOption = {
  id: string;
  name: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";

  // schedule (exactly ONE of these will exist)
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  duration: number | null; // days

  // relations
  course: {
    title: string;
  }[];

  // optional but useful for guards
  is_active?: boolean;
  admission_open?: boolean;
};

export type CourseOption = {
  id: string;
  title: string;
};
