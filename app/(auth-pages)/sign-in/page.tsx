"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [step, setStep] = useState<"initial" | "password">("initial");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailToUse, setEmailToUse] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Überprüfe, ob der Benutzer bereits eingeloggt ist
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("✅ Session:", session); // Logging der Session

      if (session) {
        // Wenn bereits eingeloggt, leite ihn zum Dashboard weiter
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [supabase, router]);

  const checkUser = async () => {
    setError("");
    console.log("Sende an API:", emailOrUsername);

    const res = await fetch("/api/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: emailOrUsername }),
    });

    const result = await res.json();
    console.log("API-Antwort:", result);

    if (result.exists) {
      setEmailToUse(result.email);
      setStep("password");
    } else if (result.legacy) {
      await supabase.auth.signUp({
        email: result.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/set-password`,
        },
        password: "tempPassword123!" // Temporäres Passwort, damit der Magic Link funktioniert
      });
      setError("Anmeldelink wurde gesendet. Bitte E-Mail prüfen.");
    } else {
      setError("Benutzer nicht gefunden.");
    }
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      setError("Falsches Passwort.");
    } else {
      router.push("/dashboard");
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

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
