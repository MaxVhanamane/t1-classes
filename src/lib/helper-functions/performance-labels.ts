// performanceLabels.ts

// 1. Define the shape of our label data
export interface PerformanceLabelDetails {
    text: string;
    color: string;
    criteria: string;
}

// 2. The Single Source of Truth (Matches your Postgres RPC exactly)
const PERFORMANCE_LABELS: Record<string, PerformanceLabelDetails> = {
    perfect: {
        text: 'Perfect',
        color: 'text-yellow-600 bg-yellow-100',
        criteria: 'Score = 100%'
    },
    outstanding: {
        text: 'Outstanding',
        color: 'text-purple-600 bg-purple-100',
        criteria: 'Score >= 90%'
    },
    excellent: {
        text: 'Excellent',
        color: 'text-blue-600 bg-blue-100',
        criteria: 'Score >= 80%'
    },
    very_good: {
        text: 'Very Good',
        color: 'text-emerald-600 bg-emerald-100',
        criteria: 'Score >= 75%'
    },
    good: {
        text: 'Good',
        color: 'text-green-600 bg-green-100',
        criteria: 'Score >= 60%'
    },
    average: {
        text: 'Average',
        color: 'text-gray-600 bg-gray-100',
        criteria: 'Score >= 40%'
    },
    needs_improvement: {
        text: 'Needs Improvement',
        color: 'text-red-600 bg-red-100',
        criteria: 'Score < 40%'
    },
};

/**
 * FUNCTION 1: Returns ONLY the readable text.
 * Use this where you just need the string (e.g., table columns, simple text blocks).
 */
export const getPerformanceLabelText = (label: string | null | undefined): string => {
    if (!label) return 'N/A';
    return PERFORMANCE_LABELS[label]?.text || 'Unknown';
};

/**
 * FUNCTION 2: Returns the full details object (text, color, and criteria).
 * Use this where you need to style a badge or show a tooltip with the grading rules.
 */
export const getPerformanceLabelDetails = (label: string | null | undefined): PerformanceLabelDetails => {
    const defaultDetails: PerformanceLabelDetails = {
        text: 'Unknown',
        color: 'text-gray-500 bg-gray-100',
        criteria: 'N/A'
    };

    if (!label) return defaultDetails;

    return PERFORMANCE_LABELS[label] || defaultDetails;
};
