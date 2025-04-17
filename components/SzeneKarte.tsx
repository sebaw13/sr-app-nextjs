'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SzeneKarteProps {
  szene: {
    id: number;
    titel: string;
    beschreibung: string;
    thumbnail_path?: string;
    themen?: string;
  };
}

export default function SzeneKarte({ szene }: SzeneKarteProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const begrenzteBeschreibung =
    szene.beschreibung?.slice(0, 50) +
    (szene.beschreibung?.length > 50 ? '...' : '');

    useEffect(() => {
      const key = szene.thumbnail_path;
      if (key && typeof key === 'string') {
        const proxyUrl = `/api/signed-url`;  // Keine Query-Parameter mehr!
        
        // Anpassen der Fetch-Anfrage auf `POST`
        const fetchSignedUrl = async () => {
          try {
            const res = await fetch(proxyUrl, {
              method: 'POST',  // POST statt GET
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key }),  // Den Key im Body übergeben
            });
    
            const json = await res.json();
            if (json.url) {
              setImageUrl(json.url);  // Setze die URL für das Bild
            }
          } catch (err) {
            console.error('❌ Fehler beim Abrufen der Signed URL:', err);
          }
        };
    
        fetchSignedUrl();
      }
    }, [szene.thumbnail_path]);  // Achte darauf, dass thumbnail_path korrekt gesetzt ist
    

  const parsedThemen = Array.isArray(szene.themen)
    ? szene.themen
    : (() => {
        try {
          const parsed = JSON.parse(szene.themen || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

  return (
    <Link
      href={`/videoszene/${szene.id}`}
      className="block w-full sm:w-1/2 md:w-1/4 p-2"
    >
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {imageUrl ? (
          <div className="h-48 w-full">
            <img
              src={imageUrl}
              alt={szene.titel}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Kein Bild verfügbar
          </div>
        )}

        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">
              {szene.titel}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {begrenzteBeschreibung}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mt-auto">
            {parsedThemen.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
