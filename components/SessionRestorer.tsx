"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SessionRestorer() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
      console.log("📦 Auth-Code gefunden:", code);

      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error("❌ Fehler beim Austausch:", error.message);
          } else {
            console.log("✅ Session gesetzt");
            router.replace("/dashboard/userdaten"); // entferne ?code=...
          }
        });
    }
  }, [supabase, router]);

  return null;
}
