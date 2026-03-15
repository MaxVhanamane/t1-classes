import { redirect } from "next/navigation"
import { ROUTES } from "../constants/route-constants"
import { AuthContext, getAuth } from "./get-auth"

export async function requireAuth(): Promise<AuthContext> {
    const auth = await getAuth()

    if (!auth) {
        redirect(ROUTES.login)
    }

    return auth
}
