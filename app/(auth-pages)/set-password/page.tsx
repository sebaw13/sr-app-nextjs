"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session || error) {
        console.warn("❌ Keine Session – redirect zu /login");
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("password_set")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("❌ Fehler beim Profilabruf:", profileError);
      }

      if (profile?.password_set === true) {
        console.log("✅ Passwort schon gesetzt → redirect zu /");
        router.push("/");
      }

      setLoading(false);
    };

    checkSession();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen enthalten.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Fehler beim Setzen des Passworts.");
    } else {
      const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  console.error("❌ Kein User vorhanden beim Passwort-Update");
  setError("Fehlende Benutzerinformationen.");
  return;
}

const { error: profileUpdateError } = await supabase
  .from("profiles")
  .update({ password_set: true })
  .eq("id", user.id);


      if (profileUpdateError) {
        console.error("❌ Fehler beim Aktualisieren von password_set:", profileUpdateError);
      } else {
        setMessage("✅ Passwort erfolgreich gesetzt.");
        setTimeout(() => router.push("/"), 1500);
      }
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Neues Passwort setzen</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Neues Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Passwort setzen
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {message && <p className="text-green-600 text-sm text-center">{message}</p>}
    </div>
  );
}
