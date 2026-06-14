export type BatchLifecycle =
    | "upcoming"
    | "ongoing"
    | "completed"


export function getBatchLifecycle(batch: {
    start_date: string;
    end_date: string;
}) {
    const today = new Date();
    const start = new Date(batch.start_date);
    const end = new Date(batch.end_date);

    if (today < start) return "upcoming";
    if (today > end) return "completed";

    return "ongoing";
}
