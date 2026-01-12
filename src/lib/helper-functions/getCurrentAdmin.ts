import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { ROUTES } from "../constants/route-constants";

export async function getCurrentAdmin() {
    const user = await getCurrentUser();

    if (user.role !== "admin") {
        redirect(ROUTES.unauthorized);
    }

    return user;
}
