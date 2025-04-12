import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  console.log("🟡 Eingehende Anfrage: /api/userdaten");

  const cookieStore = cookies(); // ✅ FIX
  console.log("🍪 Cookies:", (await cookieStore).getAll());

  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("👤 Aktueller Benutzer:", user);

  if (!user) {
    console.warn("🔴 Kein eingeloggter Benutzer gefunden");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("rollen, bezirk(name)")
    .eq("id", user.id)
    .single<{ rollen: string[] | string; bezirk?: { name?: string } }>();

  if (error || !data) {
    console.error("🔴 Fehler beim Abrufen der Rollen:", error);
    return NextResponse.json([], { status: 403 });
  }

  const rollen = Array.isArray(data.rollen)
    ? data.rollen
    : JSON.parse(data.rollen || "[]");

  const isVSA = rollen.includes("VSA");
  const isBSA = rollen.includes("BSA");
  const bezirk = data.bezirk?.name;

  console.log("🛡 Rollen:", rollen);
  console.log("✅ isVSA:", isVSA, "| ✅ isBSA:", isBSA);
  console.log("📍 Bezirk:", bezirk);

  if (!isVSA && !isBSA) {
    return NextResponse.json([], { status: 403 });
  }

  let query = supabase
    .from("profiles")
    .select("id, name, vorname, email, rollen, bezirk(name), ligatyp(name), nlz");

  if (isVSA) {
    const { data: all, error: allError } = await query;
    if (allError || !all) {
      console.error("🔴 Fehler beim Abrufen aller Profile:", allError);
      return NextResponse.json([], { status: 500 });
    }

    const erlaubteLigatypen = ["1", "2", "3", "6", "7", "8"];
    const filtered = all.filter((u: any) =>
      erlaubteLigatypen.includes(u.ligatyp?.name)
    );

    console.log(`📦 Gefilterte ${filtered.length} Datensätze für VSA`);
    return NextResponse.json(filtered);
  }

  if (isBSA && bezirk) {
    query = query.eq("bezirk.name", bezirk);
    const { data: result, error: err } = await query;
    if (err || !result) {
      console.error("🔴 Fehler beim Abrufen der BSA-Daten:", err);
      return NextResponse.json([], { status: 500 });
    }

    console.log(`📦 ${result.length} Datensätze für BSA ${bezirk}`);
    return NextResponse.json(result);
  }

  return NextResponse.json([], { status: 403 });
}
