"use client";  // Diese Direktive stellt sicher, dass die Komponente als Client-Komponente behandelt wird

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";  // Verwende 'next/navigation' statt 'next/router'
import { createClient } from "@/utils/supabase/client";  // Stelle sicher, dass du den Client importierst
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

// Supabase Client erstellen
const supabase = await createClient();


export default function DashboardPage() {
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
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList>
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
            <TabsTrigger value="users">Benutzer</TabsTrigger>
          </TabsList>
  
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card><CardContent>📈 Szenen veröffentlicht</CardContent></Card>
              <Card><CardContent>👤 Nutzer insgesamt</CardContent></Card>
              <Card><CardContent>👁️ Gesamt-Views</CardContent></Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card><CardContent>📊 Views letzte 30 Tage</CardContent></Card>
              <Card><CardContent>🔥 Meistgesehene Szenen</CardContent></Card>
            </div>
            <div className="mt-4">
              <Card><CardContent>🚨 Unbestätigte Nutzer</CardContent></Card>
            </div>
          </TabsContent>
  
          <TabsContent value="users">
            <Link href="/dashboard/users" className="text-blue-600 hover:underline">
              Zur Benutzerverwaltung
            </Link>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  