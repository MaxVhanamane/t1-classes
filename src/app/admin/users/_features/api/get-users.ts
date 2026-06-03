import { UsersResponse } from "../types/user-table";

type GetUsersParams = {
    page?: number;

    limit?: number;

    search?: string;

    role?: string;

    status?: string;
};

export async function getUsers({
    page = 1,
    limit = 10,
    search = "",
    role = "",
    status = "",
}: GetUsersParams): Promise<UsersResponse> {
    const searchParams =
        new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });

    if (search) {
        searchParams.set(
            "search",
            search,
        );
    }

    if (role) {
        searchParams.set(
            "role",
            role,
        );
    }

    if (status) {
        searchParams.set(
            "status",
            status,
        );
    }

    const response = await fetch(
        `/api/admin/users?${searchParams.toString()}`,
        {
            method: "GET",
            credentials: "include",
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            error.message ??
            "Failed to fetch users",
        );
    }

    return response.json();
}
