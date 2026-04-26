export type ServerActionResponse<T = void> =
    | { data: T }
    | { error: string }
    | void;
