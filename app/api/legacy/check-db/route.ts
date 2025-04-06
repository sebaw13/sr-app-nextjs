// /app/api/legacy/check-db/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.REACT_APP_API_URL;

  console.log("🌐 Strapi-Check via:", `${url}/api/users`);

  if (!url) {
    return NextResponse.json({ ok: false, error: "REACT_APP_API_URL fehlt" }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/api/users`, { cache: "no-store" });

    console.log("📡 Strapi Status:", res.status);

    // akzeptiere 200, 403, 401 etc. → Hauptsache kein 404 oder NetworkError
    if (res.status >= 200 && res.status < 500) {
      return NextResponse.json({ ok: true });
    } else {
      throw new Error(`Strapi antwortet mit Status ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Fehler beim Strapi-Check:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

