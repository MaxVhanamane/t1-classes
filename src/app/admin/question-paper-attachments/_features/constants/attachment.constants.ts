import { AttachmentFiltersType } from "../types/attachment-filters";

export const ATTACHMENT_DEFAULT_PAGE_SIZE =
    20;

export const DEFAULT_ATTACHMENT_FILTERS: AttachmentFiltersType =
{
    search: "",

    classLevel: null,

    targetExam: null,

    page: 1,

    pageSize:
        ATTACHMENT_DEFAULT_PAGE_SIZE,
};
