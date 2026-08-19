export type StudentMarkingRow = {
    studentId: string;
    rollNumber: number | null;
    fullName: string;
    isCompleted: boolean;
    isActive: boolean;
    markedBy: string | null;
    updatedBy: string | null;
};

export type MarkingSubmissionPayload = {
    student_id: string;
    is_completed: boolean;
};
