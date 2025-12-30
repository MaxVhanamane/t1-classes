import { getCurrentUser } from "./getCurrentUser";

export async function getCurrentStaff() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    if (user.role !== "admin" && user.role !== "teacher") {
        throw new Error("Staff access required");
    }

    if (user.status !== "active") {
        throw new Error("Inactive account");
    }

    return user;
}
