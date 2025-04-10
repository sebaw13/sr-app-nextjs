"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Überprüfe die aktuelle Session und den User
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/sign-in"); // Falls der User nicht eingeloggt ist, zurück zur Login-Seite
      }
    };

    checkSession();
  }, [supabase, router]);

  // Formular-Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Passwort darf nicht leer sein.");
      return;
    }

    // Update des Passworts in Supabase
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError("Fehler beim Setzen des Passworts.");
    } else {
      setMessage("Passwort erfolgreich gesetzt!");
      router.push("/"); // Weiterleitung nach dem Setzen des Passworts
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Passwort setzen</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Neues Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Passwort setzen</Button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-500 text-sm">{message}</p>}
    </div>
  );
}
