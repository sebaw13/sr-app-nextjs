// /app/api/legacy/migrate/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST() {
  try {
    const supabase = createClient()

    // Fetch Daten vom Legacy Backend
    const legacyUsers = await fetch(process.env.REACT_APP_API_URL + "/users")
    const users = await legacyUsers.json()

    // Migration nach Supabase
    for (const user of users) {
      await (await supabase).from("users").upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        rolle: user.rolle,
        // weitere Felder hier einfügen
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Migration Error:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
