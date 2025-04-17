import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export default async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) console.error("❌ Supabase auth error:", error.message);

  const path = request.nextUrl.pathname;
  const force = request.nextUrl.searchParams.get("force");

  if (force === "1") {
    console.log("🚪 Zugang erzwungen durch URL-Parameter");
    return response;
  }

  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/set-password");

  if (user && path === "/login") {
    console.log("✅ Eingeloggt, redirect zu /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && !isAuthPage) {
    console.log("⛔ Nicht eingeloggt, redirect zu /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("password_set")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Fehler beim Profil-Check:", profileError);
      return response;
    }

    if (profile && profile.password_set === false && path !== "/set-password") {
      console.log("🔐 Passwort noch nicht gesetzt → redirect");
      return NextResponse.redirect(new URL("/set-password", request.url));
    }
  }

  return response;
}
