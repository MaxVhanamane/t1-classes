export type CourseOutline = {
    courseId: string;
    hasAccess: boolean;
    chapters: CourseChapter[];
};
export type CourseOutlineMarketing = {
    courseId: string;
    chapters: CourseChapter[];
};


export type CourseChapter = {
    id: string;
    title: string;
    topics: CourseTopic[];
};

export type CourseTopic = {
    id: string;
    title: string;
    units: CourseUnitOutline[];
    practiceSets: PracticeSetOutline[];
};

export type CourseUnitOutline = {
    id: string;
    title: string;
    unitType: "video" | "pdf";
    durationMinutes: number | null;
    isFreePreview: boolean;
    access: "accessible" | "locked";
};

export type PracticeSetOutline = {
    id: string;
    title: string;
    access: "accessible" | "locked";
    isFreePreview: boolean;
};
