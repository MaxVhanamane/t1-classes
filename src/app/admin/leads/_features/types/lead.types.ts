export type LeadStatus =
    | 'new'
    | 'attempting_contact'
    | 'in_progress'
    | 'enrolled'
    | 'not_interested'
    | 'invalid';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
    new: "New",
    attempting_contact: "Attempting Contact",
    in_progress: "In Progress",
    enrolled: "Enrolled",
    not_interested: "Not Interested",
    invalid: "Invalid/Spam",
};

export type LeadFilters = {
    page: number;
    search: string;
    status: LeadStatus | "all";
    targetType: "all" | "course" | "batch"; // <-- Added filter state
};

export const DEFAULT_LEAD_FILTERS: LeadFilters = {
    page: 1,
    search: "",
    status: "all",
    targetType: "all",
};

export type LeadRow = {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    message: string | null;
    status: LeadStatus;
    source: string;
    created_at: string;
    updated_at: string | null;
    next_follow_up_at: string | null;
    lost_reason: string | null;
    course: { id: string; title: string } | null;
    batch: { id: string; name: string } | null;
    updated_by_user: { id: string; full_name: string } | null;
};
