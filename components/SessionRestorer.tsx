"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SessionRestorer() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      console.log("🔐 Tokens gefunden, Session wird gesetzt...");
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
        if (error) {
          console.error("❌ Fehler beim Setzen der Session:", error.message);
        } else {
          console.log("✅ Session gesetzt!");
          router.replace("/set-password"); // Nur wenn du willst, dass er direkt dahin geht
        }
      });
    }
  }, [router, supabase]);

  return null;
}
