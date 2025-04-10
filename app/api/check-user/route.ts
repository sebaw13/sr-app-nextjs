import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Input fehlt" }, { status: 400 });
    }

    console.log("✅ Eingabe:", input);

    // 1. Check: Ist der User schon in profiles vorhanden?
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .or(`email.eq.${input},username.eq.${input}`)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Fehler beim Profile-Check:", profileError);
    }

    if (profile) {
      console.log("✅ Profile gefunden, sende Magic Link...");

      const { error: loginError } = await supabase.auth.signInWithOtp({
        email: profile.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
        },
      });

      if (loginError) {
        console.error("❌ Fehler beim Senden des Magic Links:", loginError);
        return NextResponse.json(
          { error: "Fehler beim Senden des Anmeldelinks." },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Anmeldelink gesendet." });
    }

    // 2. Fallback: Suche in up_users
    const { data: legacyUser, error: legacyError } = await supabase
      .from("up_users")
      .select("*")
      .or(`email.eq.${input},username.eq.${input}`)
      .maybeSingle();

    if (legacyError) {
      console.error("❌ Fehler beim up_users-Check:", legacyError);
    }

    if (!legacyUser) {
      console.warn("⚠️ Kein Treffer in up_users.");
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    console.log("✅ Benutzer in up_users gefunden:", legacyUser.email);

    // 3. Supabase Auth-User anlegen
    const { data: createdUser, error: signUpError } = await supabase.auth.signUp({
      email: legacyUser.email,
      password: "tempPassword123!", // Temporäres Passwort
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`, // Redirect zum Setzen des Passworts
      },
    });

    if (signUpError || !createdUser.user?.id) {
      console.error("❌ Fehler beim Erstellen des Supabase Users:", signUpError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Kontos." },
        { status: 500 }
      );
    }

    // 4. Profil anlegen
    const { error: profileInsertError } = await supabase.from("profiles").insert({
      id: createdUser.user.id,
      username: legacyUser.username,
      name: legacyUser.name,
      vorname: legacyUser.vorname,
      nlz: legacyUser.nlz,
      save_view: legacyUser.save_view,
      notifications: legacyUser.notifications,
    });

    if (profileInsertError) {
      console.error("❌ Fehler beim Anlegen des Profils:", profileInsertError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Profils." },
        { status: 500 }
      );
    }

    // 5. up_users aufräumen
    await supabase.from("up_users").delete().eq("email", legacyUser.email);

    console.log("✅ Migration abgeschlossen, Anmeldelink gesendet.");

    return NextResponse.json({ message: "Anmeldelink gesendet und Benutzer migriert." });
  } catch (e) {
    console.error("❌ Unerwarteter Fehler in /api/check-user:", e);
    return NextResponse.json({ error: "Unerwarteter Serverfehler." }, { status: 500 });
  }
}
