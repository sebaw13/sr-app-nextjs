import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Nur echte geschützte Seiten – nicht global alles
    "/dashboard/:path*",
    "/meine-daten/:path*",
    "/meine-spiele/:path*",
    "/verwaltung/:path*",
    "/alle-szenen/:path*",
    "/"
    // Hier kannst du weitere protected routes ergänzen
  ],
};
