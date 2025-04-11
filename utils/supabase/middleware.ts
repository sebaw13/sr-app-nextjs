import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    const path = request.nextUrl.pathname;
    const force = request.nextUrl.searchParams.get("force");
    const response = NextResponse.next({
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
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) console.error("❌ Supabase auth error:", error.message);

    // Bypass über ?force=1
    if (force === "1") {
      console.log("🚪 Zugang erzwungen durch URL-Parameter");
      return response;
    }

    const isAuthPage =
      path.startsWith("/login") ||
      path.startsWith("/sign-up") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/set-password");

    // Eingeloggt → aber auf sign-in? → zurück zur Startseite
    if (user && path === "/login") {
      console.log("✅ Eingeloggt, redirect zu /");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Nicht eingeloggt → versuchst geschützte Seite zu laden?
    if (!user && !isAuthPage) {
      console.log("⛔ Nicht eingeloggt, redirect zu /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Wenn User eingeloggt ist, prüfe, ob er das Passwort gesetzt hat
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("password_set")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Fehler beim Profil-Check:", profileError);
        return response;
      }

      // Wenn Passwort noch nicht gesetzt wurde, leite auf /set-password weiter
      if (profile && profile.password_set === false && path !== "/set-password") {
        console.log("🔐 Passwort noch nicht gesetzt → redirect");
        return NextResponse.redirect(new URL("/set-password", request.url));
      }
    }

    return response;
  } catch (e) {
    console.error("💥 Middleware-Fehler:", e);
    return NextResponse.next();
  }
};
