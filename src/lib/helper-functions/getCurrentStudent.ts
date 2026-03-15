"use server"
import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { ROUTES } from "../constants/route-constants";

export async function getCurrentStudent() {
    const user = await getCurrentUser();

    if (user.role !== "student") {
        redirect(ROUTES.unauthorized);

    }

    return user;
}
