import { ExploreCourseMarketing } from "../types"
import { JSONContent } from "@tiptap/react"
export type ExploreCourseForBatch = ExploreCourseMarketing

export type ExploreBatchDetail = {
    id: string;

    title: string;
    subtitle: string | null;
    slug: string;

    thumbnail_image: string | null;

    start_date: string;
    end_date: string;

    mode: "online" | "offline" | "hybrid";

    languages: string[];
    location: string | null;

    /* Admissions */
    is_admission_open: boolean;

    /* Pricing */
    sale_price: number;
    list_price: number;

    /* Marketing */
    learning_outcomes: string[] | null;
    target_audience: string[] | null;

    /* Academic */
    subjects: string[] | null;
    class_level: number | null;
    target_exam: string | null;

    description: JSONContent | null;

    capacity: number | null;

    courses: ExploreCourseForBatch[];
};
