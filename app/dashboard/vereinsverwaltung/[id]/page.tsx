"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Verwende useParams statt useRouter.query
import { createClient } from "@/utils/supabase/client"; // Stelle sicher, dass du den richtigen Supabase-Client importierst

// Supabase-Client erstellen
const supabase = createClient();

type Verein = {
  id: number;
  name: string;
  ort: string;
  // Weitere Felder, die du in deiner "vereine"-Tabelle hast
};

export default function VereinBearbeitenPage() {
  const [verein, setVerein] = useState<Verein | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams(); // useParams gibt uns den "id"-Parameter aus der URL
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchVerein = async () => {
      const { data, error } = await supabase
        .from("vereine")
        .select("*")
        .eq("id", id)
        .single(); // Einzeln den Verein anhand der ID abrufen
      if (error) {
        console.error("Fehler beim Laden des Vereins:", error);
      } else {
        setVerein(data);
      }
      setLoading(false);
    };

    fetchVerein();
  }, [id]); // useEffect reagiert auf die Änderung von id

  // Sicherstellen, dass vereinId vorhanden ist und Daten geladen wurden
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!verein) {
    return <div>Verein nicht gefunden</div>;
  }

  // Funktion zum Speichern des bearbeiteten Vereins
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verein) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("vereine")
      .update({
        name: verein.name,
        ort: verein.ort,
      })
      .eq("id", verein.id);

    if (error) {
      console.error("Fehler beim Speichern des Vereins:", error);
    } else {
      // Erfolgreiches Speichern, zur Vereinsliste zurückkehren
      router.push("/dashboard/vereinsverwaltung");
    }

    setIsSaving(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verein bearbeiten</h1>

      {/* Formular zur Bearbeitung des Vereins */}
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-lg">Vereinsname</label>
          <input
            type="text"
            id="name"
            value={verein.name}
            onChange={(e) => setVerein({ ...verein, name: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ort" className="block text-lg">Ort</label>
          <input
            type="text"
            id="ort"
            value={verein.ort}
            onChange={(e) => setVerein({ ...verein, ort: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded"
          disabled={isSaving}
        >
          {isSaving ? "Speichern..." : "Speichern"}
        </button>
      </form>
    </div>
  );
}
