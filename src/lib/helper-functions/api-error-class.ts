export class ApiError<T = unknown> extends Error {
    status: number;
    info: T;

    constructor(message: string, status: number, info: T) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.info = info;
    }
}
