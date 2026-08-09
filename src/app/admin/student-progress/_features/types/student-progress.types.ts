export interface BatchStudent {
    enrollmentId: string;
    userId: string;
    rollNumber: number | null;
    isActive: boolean;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

export interface PaginatedBatchStudents {
    items: BatchStudent[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
}
