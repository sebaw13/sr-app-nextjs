"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [step, setStep] = useState<"initial" | "password" | "magic-link">("initial");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailToUse, setEmailToUse] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Session check (falls bereits eingeloggt)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push("/");
    };
    checkSession();
  }, [supabase, router]);

  const checkUser = async () => {
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: emailOrUsername }),
      });

      const result = await res.json();
      console.log("🔍 check-user result:", result);

      if (result.status === "exists") {
        setEmailToUse(result.email);
        setStep("password");
      } else if (result.status === "legacy") {
        setStep("magic-link");
        setMessage("Ein Anmeldelink wurde an deine E-Mail-Adresse gesendet.");
      } else {
        setError("Benutzer nicht gefunden.");
      }
    } catch (err) {
      console.error("❌ Fehler beim Benutzercheck:", err);
      setError("Fehler bei der Benutzerprüfung.");
    }
  };

  const login = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      setError("Falsches Passwort oder ungültige Anmeldung.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Anmelden</h1>

      {step === "initial" && (
        <>
          <Input
            placeholder="E-Mail oder Benutzername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
          <Button onClick={checkUser}>Weiter</Button>
        </>
      )}

      {step === "password" && (
        <>
          <Input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={login}>Login</Button>
        </>
      )}

      {step === "magic-link" && message && (
        <p className="text-green-600 text-sm text-center">{message}</p>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
