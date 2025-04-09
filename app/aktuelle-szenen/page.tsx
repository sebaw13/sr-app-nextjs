// app/aktuelle-szenen/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import SzeneKarte from '../../components/SzeneKarte';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type LocalPageProps = {
  searchParams?: { page?: string };
};

export default async function AktuelleSzenenPage({ searchParams }: { searchParams?: { page?: string } }) {

  const supabase = await createClient();

  const page = parseInt(searchParams?.page || '1');

  const pageSize = 4;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: releases, error } = await supabase
    .from('szenenreleases')
    .select('id, name, released_at, beschreibung, linked_videoszenen')
    .eq('status', 'Veröffentlicht')
    .order('released_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Fehler beim Laden der Releases:', error.message);
    return <div>Fehler beim Laden der Szenen.</div>;
  }

  if (!releases || releases.length === 0) {
    notFound();
  }

  const allSzenen = new Map();

  for (const release of releases) {
    let szeneIds: number[] = [];

    if (Array.isArray(release.linked_videoszenen)) {
      szeneIds = release.linked_videoszenen.map(Number).filter(id => !isNaN(id));
    } else {
      try {
        const raw = JSON.parse(release.linked_videoszenen || '[]');
        if (Array.isArray(raw)) {
          szeneIds = raw.map(Number).filter(id => !isNaN(id));
        }
      } catch (e) {
        console.warn('Fehler beim Parsen von linked_videoszenen:', release.linked_videoszenen);
      }
    }

    if (szeneIds.length > 0) {
      const { data: szenen } = await supabase
        .from('videoszenen')
        .select('id, titel, beschreibung, thumbnail_file_id, themen')
        .in('id', szeneIds);

      const thumbnailIds = (szenen || []).map(s => s.thumbnail_file_id).filter(Boolean);

      const { data: files } = await supabase
        .from('files')
        .select('id, url')
        .in('id', thumbnailIds);

      const fileMap = new Map(files?.map(f => [f.id, f.url]));
      const baseURL = 'https://bfv-vsa.fra1.digitaloceanspaces.com/';

      const enriched = (szenen || []).map(szene => ({
        ...szene,
        thumbnail_path: fileMap.get(szene.thumbnail_file_id)?.replace(baseURL, '') || null,
      }));

      allSzenen.set(release.id, enriched);
    } else {
      allSzenen.set(release.id, []);
    }
  }

  // Dynamisch berechnen basierend auf Gesamtanzahl der Releases
  const { count } = await supabase
    .from('szenenreleases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Veröffentlicht');

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Aktuelle Szenen</h1>

      {releases.map((release) => (
        <div key={release.id} className="border rounded-xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">{release.name}</h2>
          <p className="text-sm text-gray-500 mb-1">Veröffentlicht am: {release.released_at}</p>
          {release.beschreibung && <p className="text-sm text-gray-700 mt-2 mb-4">{release.beschreibung}</p>}

          <div className="flex flex-wrap -mx-2">
            {allSzenen.get(release.id)?.map((szene: any) => (
              <SzeneKarte key={szene.id} szene={szene} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center pt-6 border-t pt-4">
        {page > 1 ? (
          <Link
            href={`?page=${page - 1}`}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Zurück
          </Link>
        ) : <div />}

        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`px-3 py-1 rounded ${p === page ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {p}
            </Link>
          ))}
        </div>

        {page < totalPages ? (
          <Link
            href={`?page=${page + 1}`}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Weiter →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
