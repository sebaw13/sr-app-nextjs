// /app/api/legacy/migration/base/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ENTITIES = [
  { name: "bezirks", url: "/api/bezirks" },
  { name: "ligatyps", url: "/api/ligatyps" },
  { name: "saisons", url: "/api/saisons" },
  { name: "users", url: "/api/users" },
  { name: "vereins", url: "/api/vereins" },
];

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.REACT_APP_API_URL;
    if (!baseUrl) throw new Error("REACT_APP_API_URL ist nicht definiert");

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = createClient();
    const migrated: Record<string, number> = {};
    const failed: Record<string, string> = {};

    for (const entity of ENTITIES) {
      try {
        const res = await fetch(`${baseUrl}${entity.url}?pagination[pageSize]=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Fehler bei Abruf von ${entity.name}`);

        const json = await res.json();
        const data = json.data.map((item: any) => ({
          id: item.id,
          ...item.attributes,
        }));

        const { error } = await supabase.from(entity.name).upsert(data);
        if (error) throw new Error(error.message);

        migrated[entity.name] = data.length;
      } catch (err: any) {
        failed[entity.name] = err.message;
      }
    }

    return NextResponse.json({ migrated, failed });
  } catch (err) {
    console.error("❌ Fehler in /migration/base:", err);
    return NextResponse.json({ error: "Migration fehlgeschlagen." }, { status: 500 });
  }
}
