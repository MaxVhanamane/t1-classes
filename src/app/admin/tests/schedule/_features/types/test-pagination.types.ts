export interface TestQueryParams {
    page: number
    pageSize: number
    search?: string
}

export interface PagedTests<T> {
    items: T[]
    page: number
    pageSize: number
    total: number
    hasMore: boolean
}
