"use client";  // Diese Direktive stellt sicher, dass die Komponente als Client-Komponente behandelt wird

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";  // Verwende 'next/navigation' statt 'next/router'
import { createClient } from "@/utils/supabase/client";  // Stelle sicher, dass du den Client importierst

// Supabase Client erstellen
const supabase = await createClient();


export default function AlleSzenenPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();  // Hier den Supabase-Client verwenden
      if (!user) {
        // Falls kein User angemeldet ist, Weiterleitung zur Anmeldeseite
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    
    checkUser();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>; // Hier könntest du auch einen Spinner anzeigen
  }

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Aktuelle Szenen</h1>
      <p className="text-muted-foreground mb-6">Plane und optimiere deine Produktionsprozesse.</p>
    </div>
  );
}