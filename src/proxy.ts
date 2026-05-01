import { type NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/supabase-proxy"

export async function proxy(request: NextRequest) {

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!explore|api|serwist|manifest|icons|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|webmanifest)$).*)"
    ],
}
