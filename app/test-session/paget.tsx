"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SessionTestPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      console.log("👤 Aktiver Supabase User:", data.user);
    });
  }, [supabase]);

  return (
    <div className="p-4">
      <h2>Session Test</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
