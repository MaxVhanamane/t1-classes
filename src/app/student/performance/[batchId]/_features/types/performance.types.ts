export type TestHistoryRow = {
    id: string;
    testName: string;
    testDate: string;
    evaluatedAt: string;
    studentScore: number;
    totalMarks: number;
    percentile: number;
    rank: number;
    isTopper: boolean;
    classAverage: number;
    classHighest: number;
    studentPercentage: number;
    classAvgPercentage: number;
    classHighestPercentage: number;
    uniqueChartKey?: string;
};

export interface HomeworkHistoryRow {
    month: string;
    subject: string;
    total: number;
    completed: number;
    missed: number;
}

export type AttendanceHistoryRow = {
    month: string;
    total: number;
    present: number;
    absent: number;
};

export interface SubjectPerformance {
    subject: string;
    studentPercentage: number;
    classAveragePercentage: number;
    obtainedMarks: number;
    totalMarks: number;
    accuracyBreakdown: {
        correct: number;
        wrong: number;
        unanswered: number;
        partial: number;
    };
}

export interface SubjectHistoryNode {
    testId: string;
    testName: string;
    testDate: string;
    evaluatedAt: string;
    subjects: Array<{
        subject: string;
        percentage: number;
    }>;
}

export interface PerformanceData {
    homework: {
        summary: {
            totalAssigned: number;
            totalCompleted: number;
            totalMissed: number;
        };
        history: HomeworkHistoryRow[];
    };
    metrics: {
        totalTestsAttempted: number;
        averagePercentile: number;
        averagePercentage: number;
        questionBreakdown: {
            correct: number;
            wrong: number;
            unanswered: number;
            partiallyCorrect: number;
        };
    };
    testHistory: TestHistoryRow[];
    attendance: {
        totalSessions: number;
        presentCount: number;
        absentCount: number;
    };
    attendanceHistory: AttendanceHistoryRow[];

    performanceBySubject: SubjectPerformance[];
    subjectGrowthTrends: SubjectHistoryNode[];
}

export interface RechartsLineTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: TestHistoryRow }>;
    label?: string;
    isMobile?: boolean;
}

export interface RechartsBarTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: AttendanceHistoryRow }>;
    label?: string;
}

export interface RechartsDonutTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: { fill: string; name: string; value: number };
    }>;
}

export interface CustomXAxisTickProps {
    x?: number;
    y?: number;
    payload?: { value: string };
    data: TestHistoryRow[];
}

export interface CustomDotProps {
    cx?: number;
    cy?: number;
    payload?: TestHistoryRow;
}
