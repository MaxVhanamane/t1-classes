import { z } from "zod";
import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";

/* --------------------------------------------------------- */
/* Existing Constants (UNCHANGED)                            */
/* --------------------------------------------------------- */

export const CATEGORIES = [
    "boards",
    "neet",
    "jee",
    "cet",
    "nmms",
    "foundation",
    "govt_exam",
    "scholarship",
    "gate",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
    boards: "Boards",
    neet: "NEET",
    jee: "JEE",
    cet: "CET",
    nmms: "NMMS",
    foundation: "Foundation",
    scholarship: "Scholarship",
    govt_exam: "Govt Exams",
    gate: "GATE",
};

export const LOCATIONS = ["solapur", "kandalgaon"] as const;

export type Location = (typeof LOCATIONS)[number];

export const LOCATION_LABELS: Record<Location, string> = {
    solapur: "Solapur",
    kandalgaon: "Kandalgaon",
};

export const BOARDS = ["mh_state", "cbse", "icse"] as const;

export type Board = (typeof BOARDS)[number];

export const BOARD_LABELS: Record<Board, string> = {
    mh_state: "Maharashtra State Board (MSBSHSE)",
    cbse: "Central Board of Secondary Education (CBSE)",
    icse: "Indian Certificate of Secondary Education (ICSE)",
};

/* --------------------------------------------------------- */
/* NEW: Subjects                                             */
/* --------------------------------------------------------- */

export const SUBJECTS = [
    "physics",
    "chemistry",
    "mathematics",
    "biology",
    "science",
    "english",
    "marathi",
    "hindi",
    "history",
    "geography",
    "civics",
    "economics",
] as const;

export type Subject =
    (typeof SUBJECTS)[number];

export const SUBJECT_LABELS: Record<
    Subject,
    string
> = {
    physics: "Physics",
    chemistry: "Chemistry",
    mathematics: "Mathematics",
    biology: "Biology",
    science: "Science",
    english: "English",
    marathi: "Marathi",
    hindi: "Hindi",
    history: "History",
    geography: "Geography",
    civics: "Civics",
    economics: "Economics",
};


/* --------------------------------------------------------- */
/* NEW: Languages                                            */
/* --------------------------------------------------------- */

export const LANGUAGES = [
    "english",
    "hindi",
    "marathi",
    "hinglish",
    "minglish",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
    english: "English",
    hindi: "Hindi",
    marathi: "Marathi",
    hinglish: "Hindi + English (Mixed)",
    minglish: "Marathi + English (Mixed)",
};

/* --------------------------------------------------------- */
/* NEW: Target Exams                                         */
/* --------------------------------------------------------- */

export const TARGET_EXAMS = [
    "neet",
    "jee_main",
    "jee_advanced",
    "mht_cet",
    "nmms",
] as const;

export type TargetExam = (typeof TARGET_EXAMS)[number];

export const TARGET_EXAM_LABELS: Record<TargetExam, string> = {
    neet: "NEET (Medical Entrance)",
    jee_main: "JEE Main",
    jee_advanced: "JEE Advanced",
    mht_cet: "MHT-CET (Maharashtra Common Entrance Test)",
    nmms: "NMMS (Scholarship Exam)",
};


export const CATEGORY_TARGET_EXAMS: Record<Category, TargetExam[]> = {
    boards: [],
    neet: ["neet"],
    jee: ["jee_main", "jee_advanced"],
    cet: ["mht_cet"],
    nmms: ["nmms"],
    foundation: [],
    govt_exam: [],
    scholarship: ["nmms"],
    gate: [],
};

/* --------------------------------------------------------- */
/* Schema                                                    */
/* --------------------------------------------------------- */

export const batchSchema = z
    .object({
        /* --------------------------------------------------------- */
        /* Courses mapping                                           */
        /* --------------------------------------------------------- */
        course_ids: z.array(z.uuid()).min(1, "Select at least one course"),

        instructor_ids: z.array(z.uuid()).optional(),

        /* --------------------------------------------------------- */
        /* Basic info                                                */
        /* --------------------------------------------------------- */
        title: z
            .string()
            .min(1, "Batch title is required")
            .max(120, "Title must be 120 characters or less"),

        subtitle: z
            .string()
            .max(120, "Subtitle must be 120 characters or less")
            .nullable()
            .optional(),

        description: z.any().nullable().optional(),
        thumbnail_image: z.string().nullable().optional(),

        /* --------------------------------------------------------- */
        /* Category                                                  */
        /* --------------------------------------------------------- */
        category: z.enum(CATEGORIES, {
            message: "Please select a category",
        }),

        /* --------------------------------------------------------- */
        /* Board                                                     */
        /* --------------------------------------------------------- */
        board: z.enum(BOARDS).nullable().optional(),

        /* --------------------------------------------------------- */
        /* Academic metadata                                         */
        /* --------------------------------------------------------- */
        subjects: z
            .array(
                z.object({
                    value: z.enum(SUBJECTS),
                })
            )
            .max(10, "Too many subjects")
            .nullable()
            .optional(),

        class_level: z
            .number()
            .int()
            .min(6, "Class level must be between 6 and 12")
            .max(12, "Class level must be between 6 and 12")
            .nullable()
            .optional(),

        target_exam: z.enum(TARGET_EXAMS).nullable().optional(),

        /* --------------------------------------------------------- */
        /* Pricing                                                   */
        /* --------------------------------------------------------- */
        sale_price: z.number().min(0, "Sale price must be ≥ 0"),
        list_price: z.number().min(0, "List price must be ≥ 0"),

        /* --------------------------------------------------------- */
        /* Marketing content                                         */
        /* --------------------------------------------------------- */
        learning_outcomes: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Outcome cannot be empty")
                        .max(
                            MARKETING_LIMITS.BATCH.LEARNING_OUTCOME_MAX,
                            `Max ${MARKETING_LIMITS.BATCH.LEARNING_OUTCOME_MAX} characters`
                        ),
                })
            )
            .max(MARKETING_LIMITS.BATCH.MAX_ITEMS)
            .nullable()
            .optional(),

        target_audience: z
            .array(
                z.object({
                    value: z
                        .string()
                        .trim()
                        .min(1, "Audience cannot be empty")
                        .max(
                            MARKETING_LIMITS.BATCH.TARGET_AUDIENCE_MAX,
                            `Max ${MARKETING_LIMITS.BATCH.TARGET_AUDIENCE_MAX} characters`
                        ),
                })
            )
            .max(MARKETING_LIMITS.BATCH.MAX_ITEMS)
            .nullable()
            .optional(),

        /* --------------------------------------------------------- */
        /* Delivery config                                           */
        /* --------------------------------------------------------- */
        mode: z.enum(["offline", "online", "hybrid"]),

        capacity: z.number().int().positive().nullable().optional(),

        languages: z
            .array(z.enum(LANGUAGES))
            .min(1, "Select at least one language"),

        location: z.enum(LOCATIONS).nullable().optional(),

        address: z
            .string()
            .max(200, "Address must be 200 characters or less")
            .nullable()
            .optional(),

        /* --------------------------------------------------------- */
        /* Lifecycle                                                 */
        /* --------------------------------------------------------- */
        start_date: z.string().min(1, "Start date is required"),
        end_date: z.string().min(1, "End date is required"),

        /* --------------------------------------------------------- */
        /* Visibility & admissions                                   */
        /* --------------------------------------------------------- */
        is_active: z.boolean(),
        is_admission_open: z.boolean(),
    })

    /* ----------------------------------------------------------- */
    /* Validations                                                 */
    /* ----------------------------------------------------------- */

    .refine(
        (data) => new Date(data.end_date) >= new Date(data.start_date),
        {
            message: "End date must be after start date",
            path: ["end_date"],
        }
    )

    .refine(
        (data) => data.list_price >= data.sale_price,
        {
            message: "List price must be ≥ sale price",
            path: ["list_price"],
        }
    )

    .refine(
        (data) => {
            if (data.mode === "offline" || data.mode === "hybrid") {
                return !!data.location;
            }
            return true;
        },
        {
            message: "Location is required for offline and hybrid batches",
            path: ["location"],
        }
    )

    .refine(
        (data) => {
            if (data.category === "boards") {
                return !!data.board;
            }
            return true;
        },
        {
            message: "Board is required for board category",
            path: ["board"],
        }
    )
    .refine(
        (data) => {
            // boards → no exam allowed
            if (data.category === "boards") {
                return data.target_exam == null;
            }

            // if exam is provided → it must be valid (already ensured by z.enum)
            return true;
        },
        {
            message: "Invalid target exam for selected category",
            path: ["target_exam"],
        }
    );
export type BatchFormValues = z.infer<typeof batchSchema>;
