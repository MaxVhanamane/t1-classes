export type MyRankResponse =
    | {
        kind: "pending";
        message: string;
        endsAt: string;
    }
    | {
        kind: "ok";
        distributionId: string;
        rank: number;
        totalParticipants: number;
        obtainedMarks: number;
        totalMarks: number;
        performanceLabel: string | null;
    };
