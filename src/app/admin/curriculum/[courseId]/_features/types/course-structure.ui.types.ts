import { TopicWithCount } from "./course-structure.types";

export type Topic = {
    id: string;
    title: string;
    sort_order: number;
};

export type Chapter = {
    id: string;
    title: string;
    sort_order: number;
    is_published: boolean,
    topics: TopicWithCount[];
};
