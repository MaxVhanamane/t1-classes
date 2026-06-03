export type AttendanceStatus =
    | "present"
    | "absent";

export type AttendanceSessionListItem = {
    id: string;

    batch_id: string;

    batch_title: string;

    created_by: string | null;

    created_by_name: string | null;

    created_at: string;

    total_students: number;

    present_count: number;

    absent_count: number;
};

export type AttendanceStudentItem = {
    enrollment_id: string;

    user_id: string;

    roll_number: number;

    full_name: string;

    status: AttendanceStatus;
};

export type AttendanceSessionDetail = {
    id: string;

    batch_id: string;

    batch_title: string;

    created_at: string;

    created_by: string | null;

    created_by_name: string | null;

    students: AttendanceStudentItem[];
};

export type AttendanceBatchOption = {
    id: string;

    title: string;
};

export type AttendanceReportStudent = {
    user_id: string;

    roll_number: number;

    full_name: string;

    present_count: number;

    absent_count: number;

    attendance_percentage: number;
};

export type AttendanceReportFilters = {
    batch_id?: string;

    student_id?: string;

    start_date?: string;

    end_date?: string;
};

export type AttendanceRecordInput = {
    enrollment_id: string;

    status: AttendanceStatus;
};

export type CreateAttendanceSessionInput = {
    batch_id: string;
};

export type CreateAttendanceSessionResponse = {
    sessionId: string;

    created: boolean;
};

export type UpdateAttendanceSessionInput = {
    session_id: string;

    records: AttendanceRecordInput[];
};



export type AttendanceHistoryResponse = {
    items: AttendanceSessionListItem[];

    totalCount: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export type AttendanceHistoryFilters = {
    batchId?: string;

    startDate?: string;

    endDate?: string;

    page: number;

    pageSize: number;
};


export type AttendanceBatchReportRow = {
    enrollment_id: string;

    user_id: string;

    roll_number: number;

    full_name: string;

    is_active: boolean;

    present_count: number;

    absent_count: number;

    classes_during_enrollment: number;

    attendance_percentage: number;
};


export type AttendanceBatchReportSummary = {
    batch_id: string;

    batch_title: string;

    total_students: number;

    active_students: number;

    average_attendance: number;

    below_75_count: number;
};

export type AttendanceBatchReportResponse = {
    summary: AttendanceBatchReportSummary;

    items: AttendanceBatchReportRow[];

    totalCount: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export type AttendanceStudentOption = {
    user_id: string;

    roll_number: number;

    full_name: string;
};

export type AttendanceStudentSession = {
    attendance_record_id: string;

    session_id: string;

    attendance_date: string;

    status: AttendanceStatus;

    created_by_name: string | null;

    created_at: string;

    updated_at: string | null;

    updated_by_name: string | null;
};

export type AttendanceStudentReportSummary = {
    enrollment_id: string;

    user_id: string;

    full_name: string;

    roll_number: number;

    batch_id: string;

    batch_title: string;

    is_active: boolean;

    present_count: number;

    absent_count: number;

    classes_during_enrollment: number;

    total_batch_classes: number;

    attendance_percentage: number;
};

export type AttendanceStudentReportResponse = {
    summary: AttendanceStudentReportSummary;

    sessions: AttendanceStudentSession[];

    totalCount: number;

    page: number;

    pageSize: number;

    totalPages: number;
};

export type AttendanceStudentReportFilters = {
    batchId: string;

    userId: string;

    startDate?: string;

    endDate?: string;

    page: number;

    pageSize: number;
};
