"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Stelle sicher, dass du den richtigen Supabase-Client importierst

// Supabase-Client erstellen
const supabase = createClient();

type Verein = {
  id: number;
  name: string;
  ort: string;
  // Weitere Felder, die du in deiner "vereine"-Tabelle hast
};

export default function VereinsverwaltungPage() {
  const [vereine, setVereine] = useState<Verein[]>([]); // State für die Vereine
  const router = useRouter();

  useEffect(() => {
    // Daten aus der "vereine"-Tabelle abfragen
    const fetchVereine = async () => {
      const { data, error } = await supabase.from("vereine").select("*");
      if (error) {
        console.error("Fehler beim Laden der Vereine:", error);
      } else {
        setVereine(data);
      }
    };

    fetchVereine();
  }, []);

  // Funktion, um zur Bearbeitungsseite zu navigieren
  const handleEdit = (vereinId: number) => {
    router.push(`/dashboard/vereinsverwaltung/${vereinId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🏟️ Vereinsverwaltung</h1>

      {/* Tabelle der Vereine */}
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Vereinsname</th>
            <th className="px-4 py-2 border">Ort</th>
            <th className="px-4 py-2 border">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {vereine.map((verein) => (
            <tr key={verein.id}>
              <td className="px-4 py-2 border">{verein.name}</td>
              <td className="px-4 py-2 border">{verein.ort}</td>
              <td className="px-4 py-2 border">
                {/* Bearbeiten-Button */}
                <button
                  onClick={() => handleEdit(verein.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Bearbeiten
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
