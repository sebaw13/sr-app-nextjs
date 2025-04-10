import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Input fehlt" }, { status: 400 });
    }

    console.log("✅ Eingabe:", input);

    // 1. Check in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .or(`email.eq.${input},username.eq.${input}`)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Fehler beim Profile-Check:", profileError);
    }

    if (profile?.email) {
      console.log("📩 Sende Magic Link für bestehenden Nutzer");

      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: profile.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
        },
      });

      if (linkError) {
        console.error("❌ Fehler beim Senden des Magic Links:", linkError);
        return NextResponse.json(
          { error: "Fehler beim Senden des Anmeldelinks." },
          { status: 500 }
        );
      }

      return NextResponse.json({ status: "exists", email: profile.email });
    }

    // 2. Check in up_users
    const { data: legacyUser, error: legacyError } = await supabase
      .from("up_users")
      .select("*")
      .or(`email.eq.${input},username.eq.${input}`)
      .maybeSingle();

    if (legacyError) {
      console.error("❌ Fehler beim up_users-Check:", legacyError);
    }

    if (!legacyUser) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    console.log("🔁 Starte Migration für:", legacyUser.email);

    // 3. Admin: Verifizierten Auth-User anlegen
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: legacyUser.email,
      password: "tempPassword123!",
      email_confirm: true,
    });

    if (createError || !createdUser?.user?.id) {
      console.error("❌ Fehler beim Erstellen des Auth-Users:", createError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Auth-Users." },
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
      email: legacyUser.email,
      rollen: legacyUser.rollen,         // TEXT[]
      ligatyp: legacyUser.ligatyp,       // INTEGER
      bezirk: legacyUser.bezirk          // INTEGER
    });

    if (profileInsertError) {
      console.error("❌ Fehler beim Anlegen des Profils:", profileInsertError);
      return NextResponse.json({ error: "Fehler beim Erstellen des Profils." }, { status: 500 });
    }

    // 5. up_users Eintrag löschen
    await supabase.from("up_users").delete().eq("email", legacyUser.email);

    // 6. Jetzt: Magic Link schicken über signInWithOtp
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: legacyUser.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
      },
    });

    if (magicError) {
      console.error("❌ Fehler beim Senden des Magic Links:", magicError);
      return NextResponse.json(
        { error: "Profil erstellt, aber Anmeldelink konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    console.log("✅ Migration abgeschlossen & Magic Link gesendet");

    return NextResponse.json({ status: "legacy", email: legacyUser.email });
  } catch (e) {
    console.error("💥 Unerwarteter Fehler:", e);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
