"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

const supabase = createClient();

export default function MigrationPage() {
  const [videoszenen, setVideoszenen] = useState<any[]>([]);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSignedUrl = async (key: string) => {
    try {
      const res = await fetch(`/api/signed-url?key=${encodeURIComponent(key)}`);
      const json = await res.json();
      return json.signedUrl ?? null;
    } catch (err) {
      console.error("Fehler beim Laden des signierten Links:", err);
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorLog([]);
    const { data: videoszenenRaw, error } = await supabase.from("videoszenen").select("*");

    if (error) {
      setErrorLog(["Fehler beim Laden der Videoszenen: " + error.message]);
      setLoading(false);
      return;
    }

    const result = await Promise.all(
      (videoszenenRaw || []).map(async (szene) => {
        try {
          const { data: morphs, error: morphError } = await supabase
            .from("files_related_morphs")
            .select("*")
            .eq("related_id", szene.id)
            .in("related_type", ["videoszene", "api::videoszene.videoszene"])
            .in("field", ["thumbnail", "Thumbnail", "bild"])
            .limit(5);

          if (morphError) throw new Error("Fehler beim Abrufen der Morph-Verknüpfung: " + morphError.message);
          if (!morphs || morphs.length === 0) throw new Error("Kein Thumbnail-Morph gefunden");

          const file_id = morphs[0].file_id;

          const { data: file, error: fileError } = await supabase
            .from("files")
            .select("*")
            .eq("id", file_id)
            .maybeSingle();

          if (fileError || !file) throw new Error("File nicht gefunden");

          const signedUrl = await fetchSignedUrl(file.url);

          return { ...szene, thumbnail: { ...file, signedUrl } };
        } catch (err: any) {
          console.warn(`Fehler bei Videoszene ${szene.id}:`, err.message);
          setErrorLog((prev) => [...prev, `Fehler bei Videoszene ${szene.id}: ${err.message}`]);
          return { ...szene, thumbnail: null };
        }
      })
    );

    setVideoszenen(result);
    setLoading(false);
  };

  const migrateThumbnails = async () => {
    setLoading(true);
    const errors: string[] = [];

    for (const szene of videoszenen) {
      if (!szene.thumbnail?.id) continue;
      const { error } = await supabase
        .from("videoszenen")
        .update({ thumbnail_file_id: szene.thumbnail.id })
        .eq("id", szene.id);

      if (error) {
        errors.push(`Fehler beim Setzen für Videoszene ${szene.id}: ${error.message}`);
      }
    }

    setErrorLog(errors);
    setLoading(false);
  };

  const getThumbnailUrl = (szene: any) => {
    const file = szene.thumbnail;
    if (!file || !file.signedUrl) return null;
    return file.signedUrl;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Migration: Thumbnail-Zuordnung</h1>
      <div className="flex gap-4">
        <Button onClick={fetchData} disabled={loading}>Thumbnails prüfen</Button>
        <Button onClick={migrateThumbnails} disabled={loading || videoszenen.length === 0}>Migration ausführen</Button>
      </div>

      {errorLog.length > 0 && (
        <div className="bg-red-100 border border-red-300 p-4 rounded text-sm text-red-700">
          <p className="font-semibold mb-2">Fehlerprotokoll:</p>
          <ul className="list-disc list-inside space-y-1">
            {errorLog.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoszenen.map((szene) => (
          <Card key={szene.id} className="shadow-md">
            <CardContent className="p-4">
              {szene.thumbnail ? (
                <Image
                  src={getThumbnailUrl(szene)}
                  alt={`Thumbnail ${szene.titel}`}
                  width={320}
                  height={180}
                  className="rounded-md object-cover mb-3"
                />
              ) : (
                <p className="text-sm text-muted-foreground italic mb-3">Kein Thumbnail gefunden</p>
              )}
              <h3 className="text-lg font-medium">{szene.titel}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {szene.beschreibung?.substring(0, 80)}...
              </p>
              <Badge variant="outline">{szene.arbeitsstatus}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}