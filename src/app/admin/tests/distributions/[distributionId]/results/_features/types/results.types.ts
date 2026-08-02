import { AnswerMode } from "@/src/app/api/tests/attempts/[attemptId]/attempt-types";

export interface SectionDetail {
    sectionId: string;
    subjectLabel: string;
    sectionTitle: string;
    answerMode: AnswerMode;
    sectionTotalMarks: number;
    sectionTotalQuestions: number;
}

export interface DistributionResultsSummary {
    testTitle: string;
    testType: "standard" | "sectioned";
    totalMarks: number;
    totalQuestions: number;
    totalSections: number;
    batchId: string;
    participants: number;
    submitted: number;
    inProgress: number;
    expired: number;
    averageScore: number | null;
    topScore: number | null;
    sections: SectionDetail[];
}

export interface DatabaseSummaryRow {
    test_title: string;
    test_type: "standard" | "sectioned";
    total_marks: number | string;
    total_questions: number | string;
    total_sections: number | string;
    batch_id: string;
    participants: number | string;
    submitted: number | string;
    in_progress: number | string;
    expired: number | string;
    average_score: number | string | null;
    top_score: number | string | null;
    section_details: Array<{
        section_id: string;
        subject_label: string;
        section_title: string;
        answer_mode: AnswerMode;
        section_total_marks: number | string;
        section_total_questions: number | string;
    }>;
}

// Added 'score_desc' to match our updated RPC
export type ResultsSort = "rank" | "name" | "time" | "score_desc";

// NEW: Interface for the section-wise performance of a student
export interface StudentSectionResult {
    sectionId: string;
    sectionTitle: string;
    subjectLabel: string;
    obtainedMarks: number;
    answerMode: AnswerMode
    totalMarks: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    partialCorrectCount: number;
    activeTimeSeconds: number;
}

export interface DistributionResultRow {
    id: string;
    user_id: string;
    attempt_id: string;
    student_name: string;
    student_email: string | null;
    obtained_marks: number;
    total_marks: number;
    rank: number | null;
    percentile: number | null;
    correct_count: number;
    partial_correct_count: number;
    wrong_count: number;
    unanswered_count: number;
    completion_percentage: number;
    time_spent_seconds: number;
    active_time_seconds: number;
    performance_label: string | null;
    evaluated_at: string | null;
    submitted_at: string | null;

    // NEW: Array holding the student's performance per section
    sectionResults: StudentSectionResult[];
}

export interface ResultsQueryParams {
    distributionId: string;
    page: number;
    pageSize?: number;
    search?: string;
    sort?: ResultsSort;
}

export interface PagedResults {
    items: DistributionResultRow[];
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}
