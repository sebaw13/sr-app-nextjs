import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        setAll(cookies) {
          cookies.forEach(async ({ name, value, options }) => {
            (await cookieStore).set({ name, value, ...options });
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    console.log("❌ Nicht eingeloggt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.log("❌ Kein Profil gefunden");
    return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });
  }

  console.log("👤 Aktives Profil:", profile);

  let rollen: string[] = [];

  if (Array.isArray(profile.rollen)) {
    rollen = profile.rollen;
  } else if (typeof profile.rollen === "string") {
    try {
      rollen = JSON.parse(profile.rollen);
    } catch {
      rollen = [profile.rollen];
    }
  }

  const bezirk = profile.bezirk;
  console.log("🔎 Rollen:", rollen);
  console.log("🔎 Bezirk:", bezirk);

  if (!rollen || rollen.length === 0) {
    console.log("❌ Keine Rollen gefunden");
    return NextResponse.json({ error: "Keine Rollen gefunden" }, { status: 403 });
  }

  // Lade auch bezirk.name und ligatyp.name aus Referenzen
  let profilesQuery = supabase
    .from("profiles")
    .select("*, bezirk(name), ligatyp(name)");

  let legacyQuery = supabase
    .from("up_users")
    .select("*, bezirk(name), ligatyp(name)");

  if (rollen.includes("BSA")) {
    console.log("🔍 Filter für BSA (bezirk = " + bezirk + ")");
    profilesQuery = profilesQuery.eq("bezirk", bezirk);
    legacyQuery = legacyQuery.eq("bezirk", bezirk);
  } else if (rollen.includes("VSA")) {
    console.log("🔍 Filter für VSA (ligatyp IN 1,2,3,7,8)");
    profilesQuery = profilesQuery.in("ligatyp", [1, 2, 3, 7, 8]);
    legacyQuery = legacyQuery.in("ligatyp", [1, 2, 3, 7, 8]);
  } else {
    console.log("❌ Keine Berechtigung laut Rolle:", rollen);
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const [{ data: usersProfiles, error: error1 }, { data: usersLegacy, error: error2 }] = await Promise.all([
    profilesQuery,
    legacyQuery,
  ]);

  if (error1 || error2) {
    console.log("❌ Fehler bei Query:", error1?.message || error2?.message);
    return NextResponse.json(
      { error: error1?.message || error2?.message },
      { status: 500 }
    );
  }

  const users = [...(usersProfiles || []), ...(usersLegacy || [])];

  console.log("✅ Gefundene Nutzer:", users.length);

  return NextResponse.json({ users });
}
