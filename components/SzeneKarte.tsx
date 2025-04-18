'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


const supabase = createClientComponentClient(); // oder <any> bei Bedarf


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
  const supabase = createClientComponentClient<Database>(); // Typ optional

  const begrenzteBeschreibung =
    szene.beschreibung?.slice(0, 50) +
    (szene.beschreibung?.length > 50 ? '...' : '');

  useEffect(() => {
    const fetchImage = async () => {
      const key = szene.thumbnail_path;
      if (!key) return;

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const proxyUrl = `https://cqzoinogymcxvnsldwlz.supabase.co/functions/v1/thumbnail?key=${encodeURIComponent(
        key
      )}`;

      try {
        const res = await fetch(proxyUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setImageUrl(data.url);
        } else {
          console.error('❌ Fehler beim Abrufen des Bildes:', res.statusText);
        }
      } catch (err) {
        console.error('❌ Fehler beim Abrufen der Bild-URL:', err);
      }
    };

    fetchImage();
  }, [szene.thumbnail_path, supabase]);

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
        {imageUrl && (
          <div className="h-48 w-full">
            <img
              src={imageUrl}
              alt={szene.titel}
              className="w-full h-full object-cover"
            />
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
