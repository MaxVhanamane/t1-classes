"use server"
import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { ROUTES } from "../constants/route-constants";

export async function getCurrentStaff() {
    const user = await getCurrentUser();

    if (user.role !== "admin" && user.role !== "teacher") {
        redirect(ROUTES.unauthorized);
    }

    return user;
}
