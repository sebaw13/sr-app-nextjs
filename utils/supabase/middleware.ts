import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
          },
        },
      }
    );

    const { data: user } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    // Wenn der Benutzer eingeloggt ist, aber auf `/sign-in` zugreifen möchte, leite ihn zum Dashboard weiter.
    if (user && path === "/sign-in") {
      return NextResponse.redirect(new URL("/", request.url)); // Weiterleitung zum Dashboard
    }

    // Geschützte Routen definieren (z. B. Dashboard, Profile, etc.)
    const isProtected = !path.startsWith("/sign-in") && !path.startsWith("/sign-up") && !path.startsWith("/forgot-password");

    if (isProtected && !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url)); // Weiterleitung, falls nicht eingeloggt
    }

    return response;
  } catch (e) {
    console.error("Error in middleware", e);
    return NextResponse.next();
  }
};
