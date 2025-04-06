// /app/api/legacy/simulate-migration/route.ts
import { NextRequest, NextResponse } from "next/server";

const ENTITIES = [
  { name: "bezirks", url: "/api/bezirks", required: [] },
  { name: "ligas", url: "/api/ligas", required: [] },
  { name: "saisons", url: "/api/saisons", required: [] },
  { name: "ligatyps", url: "/api/ligatyps", required: [] },
  { name: "vereins", url: "/api/vereins", required: [] },
  { name: "users", url: "/api/users", required: [] },
  {
    name: "ligazuordnungen",
    url: "/api/ligazuordnungen",
    required: ["liga", "saison", "verein"],
  },
  {
    name: "spiels",
    url: "/api/spiels",
    required: ["liga", "saison", "heimverein", "gastverein"],
  },
  {
    name: "videoszenes",
    url: "/api/videoszenes",
    required: ["spiel"],
  },
  {
    name: "szenenreleases",
    url: "/api/szenenreleases",
    required: ["videoszene"],
  },
  {
    name: "user-szenens",
    url: "/api/user-szenens",
    required: ["user", "videoszene"],
  },
  {
    name: "videoszene-views",
    url: "/api/videoszene-views",
    required: ["videoszene"],
  },
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

    const simulation: any[] = [];

    for (const entity of ENTITIES) {
      try {
        const url = `${baseUrl}${entity.url}?pagination[pageSize]=50&populate=*`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        const items = json.data || [];
        let missing = 0;
        const details: any[] = [];

        for (const item of items) {
          const missingFields: string[] = [];

          for (const relation of entity.required) {
            const field = item.attributes?.[relation];
            const hasRelation = field && field.data && field.data.id;
            if (!hasRelation) {
              missingFields.push(relation);
            }
          }

          if (missingFields.length > 0) {
            missing++;
            details.push({ id: item.id, missingFields });
          }
        }

        simulation.push({
          name: entity.name,
          total: items.length,
          missing,
          details,
        });
      } catch (err) {
        simulation.push({ name: entity.name, total: 0, missing: -1, details: [] });
      }
    }

    return NextResponse.json({ simulation });
  } catch (err) {
    console.error("❌ Fehler in /simulate-migration:", err);
    return NextResponse.json(
      { error: "Fehler bei der Simulation" },
      { status: 500 }
    );
  }
}
