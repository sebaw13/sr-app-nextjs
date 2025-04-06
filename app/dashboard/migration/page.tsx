"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export default function MigrationPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [examples, setExamples] = useState<Record<string, unknown>>({});
  const [failed, setFailed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const fetchEntityCounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/legacy/entity-counts", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fehler beim Abruf");
      setCounts(json.counts || {});
      setExamples(json.examples || {});
      setFailed(json.failed || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulation = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/legacy/simulate-migration", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fehler bei der Simulation");
      setSimulation(json.simulation || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ ok }: { ok: boolean }) => {
    return ok ? (
      <CheckCircle className="text-green-500 h-5 w-5" />
    ) : (
      <XCircle className="text-red-500 h-5 w-5" />
    );
  };

  const renderExample = (data: unknown): ReactNode => {
    try {
      return <pre className="ml-6 text-xs bg-muted p-2 rounded text-muted-foreground overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>;
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Migrationstool</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <Button onClick={fetchEntityCounts} disabled={loading}>
              Datenbestand abfragen
            </Button>
            <Button onClick={fetchSimulation} disabled={loading}>
              Migration simulieren
            </Button>

            {loading && <p>Lade...</p>}
            {error && <p className="text-red-500 whitespace-pre-wrap">{error}</p>}

            {Object.keys(counts).length > 0 && (
              <div className="space-y-6">
                <div>
                  <p className="font-semibold">Datenbestand:</p>
                  <ul className="text-sm list-disc list-inside">
                    {Object.entries(counts).map(([key, val]) => (
                      <li key={key} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon ok={!failed.includes(key)} />
                          <span>{key}: {val} Einträge</span>
                        </div>
                        {examples[key] ? renderExample(examples[key]) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {simulation.length > 0 && (
              <div className="pt-4">
                <p className="font-semibold">Simulationsanalyse:</p>
                <ul className="text-sm list-disc list-inside space-y-2">
                  {simulation.map((s) => (
                    <li key={s.name} className="flex flex-col">
                      <div className="flex gap-2 items-center">
                        <StatusIcon ok={s.missing === 0} />
                        <span>
                          {s.name}: {s.total} Einträge, {s.missing} fehlende Abhängigkeiten
                        </span>
                        {s.missing > 0 && (
                          <Button
                            variant="link"
                            className="text-xs"
                            onClick={() => setShowDetails((prev) => ({ ...prev, [s.name]: !prev[s.name] }))}
                          >
                            {showDetails[s.name] ? "Details ausblenden" : "Fehlende anzeigen"}
                          </Button>
                        )}
                      </div>

                      {showDetails[s.name] && (
                        <ul className="ml-6 text-xs text-muted-foreground space-y-1">
                          {s.details.map((d: any) => (
                            <li key={d.id}>
                              ID {d.id}: fehlend → {d.missingFields.join(", ")}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {failed.length > 0 && (
              <div>
                <p className="text-red-600 font-medium">Fehlgeschlagene Endpunkte:</p>
                <ul className="list-disc list-inside text-sm text-red-500">
                  {failed.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
