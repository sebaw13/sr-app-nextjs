import updateSession from "@/utils/supabase/middleware"; // ✅ default import
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Protect all routes except for public ones (auth pages & statics)
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
