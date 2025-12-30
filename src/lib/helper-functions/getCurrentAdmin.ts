import { getCurrentUser } from "./getCurrentUser";

export async function getCurrentAdmin() {
    const user = await getCurrentUser();

    if (user.role !== "admin") {
        throw new Error("Admin access required");
    }

    return user;
}
