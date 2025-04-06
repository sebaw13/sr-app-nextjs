// /app/api/legacy/entity-counts/route.ts
import { NextRequest, NextResponse } from "next/server";

const entities = [
  "bezirks",
  "ligas",
  "vereins",
  "users",
  "videoszenes",
  "ligatyps",
  "ligazuordnungen",
  "saisons",
  "szenenreleases",
  "user-szenens",
  "videoszene-views",
  "spiels",
];

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.REACT_APP_API_URL;
    if (!baseUrl) throw new Error("REACT_APP_API_URL ist nicht definiert");

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const counts: Record<string, number> = {};
    const examples: Record<string, unknown> = {};
    const failed: string[] = [];
    const API_PREFIX = "/api";

    for (const entity of entities) {
      try {
        const url = entity === "users"
          ? `${baseUrl}/api/users?pagination[pageSize]=1&populate=*`
          : `${baseUrl}${API_PREFIX}/${entity}?pagination[pageSize]=1&populate=*`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          console.warn(`⚠️ Fehlerantwort für [${entity}]:`, text);
          throw new Error(`Fehler bei ${entity}`);
        }

        const json = await res.json();
        const total = json.meta?.pagination?.total ?? json.length ?? 0;
        const example = json.data?.[0] ?? null;

        counts[entity] = total;
        examples[entity] = example;
      } catch (err) {
        counts[entity] = 0;
        failed.push(entity);
        examples[entity] = { error: true };
        console.warn(`❌ Fehler beim Abruf von [${entity}]:`, err);
      }
    }

    return NextResponse.json({ counts, examples, failed });
  } catch (err) {
    console.error("❌ Fehler in /entity-counts:", err);
    return NextResponse.json({ error: "Fehler beim Laden der Entitäten." }, { status: 500 });
  }
}
