import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import SzeneKarte from '@/components/SzeneKarte';
import FilterComponent from '@/components/FilterComponent';
import Pagination from '@/components/Pagination';

export default async function AlleSzenenPage() {
  const supabase = await createClient();

  const headersList = headers();
  const requestUrl = (await headersList).get('x-url') || '';
  const url = new URL(requestUrl, 'http://localhost');
  const searchParams = url.searchParams;

  const currentPage = Number(searchParams.get('page') ?? '1');
  const pageSize = 16;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const tab = searchParams.get('tab') ?? 'Thema';
  const kategorie = searchParams.get('kategorie') ?? '';
  const ratingMin = Number(searchParams.get('ratingMin') ?? '1');
  const ratingMax = Number(searchParams.get('ratingMax') ?? '6');
  const saison = searchParams.get('saison') ?? '';
  const liga = searchParams.get('liga') ?? '';
  const verein = searchParams.get('verein') ?? '';
  const themenString = searchParams.get('themen') ?? '';
  const selectedThemes = themenString.split(',').map((t) => t.trim()).filter(Boolean);

  const { data: vereineList, error: vereineError } = await supabase
    .from('vereine')
    .select('id, name')
    .order('name', { ascending: true });

  if (vereineError) {
    console.error('Fehler beim Laden der Vereine:', vereineError.message);
  }

  let passendeSpielIds: number[] = [];
  if (verein) {
    const { data: spieleMatches } = await supabase
      .from('spiele')
      .select('id')
      .or(`heimverein_id.eq.${verein},gastverein_id.eq.${verein}`);

    passendeSpielIds = spieleMatches?.map((s) => s.id) ?? [];
  }

  const hasFilter =
    selectedThemes.length > 0 ||
    kategorie ||
    searchParams.has('ratingMin') ||
    searchParams.has('ratingMax') ||
    saison ||
    liga ||
    verein;

  let query = supabase
    .from('videoszenen')
    .select(
      `
      id, titel, beschreibung, thumbnail_file_id, updated_at,
      bewertungen, themen, spiel_id
    `,
      { count: 'exact' }
    )
    .eq('arbeitsstatus', 'published')
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (hasFilter) {
    if (kategorie) {
      query = query.eq('kategorie', kategorie);
    }

    if (!isNaN(ratingMin)) {
      query = query.gte('bewertung', ratingMin);
    }

    if (!isNaN(ratingMax)) {
      query = query.lte('bewertung', ratingMax);
    }

    if (selectedThemes.length > 0) {
      query = query.overlaps('themen', selectedThemes);
    }

    if (saison || liga) {
      let filterSpielQuery = supabase.from('spiele').select('id');
      if (saison) filterSpielQuery = filterSpielQuery.eq('saison', saison);
      if (liga) filterSpielQuery = filterSpielQuery.eq('liga', liga);

      const { data: spieleGefiltert } = await filterSpielQuery;
      const spielIds = spieleGefiltert?.map((s) => s.id) ?? [];

      if (spielIds.length > 0) {
        query = query.in('spiel_id', spielIds);
      } else {
        return (
          <div className="w-11/12 mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Alle Szenen</h1>
            <FilterComponent
              activeTab={tab}
              selectedCategory={kategorie}
              selectedTheme={selectedThemes}
              minRating={ratingMin}
              maxRating={ratingMax}
              selectedSeason={saison}
              selectedLeague={liga}
              selectedClub={verein}
              vereine={vereineList ?? []}
            />
            <p className="mt-4 text-gray-600">Keine Szenen gefunden.</p>
          </div>
        );
      }
    }

    if (verein && passendeSpielIds.length > 0) {
      query = query.in('spiel_id', passendeSpielIds);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('❌ Supabase Fehler:', error.message);
    return <div className="text-red-500 p-4">Fehler beim Laden der Szenen.</div>;
  }

  // ✅ thumbnail_path auf Basis der files-Tabelle generieren (wie in aktuelle-szenen)
  const thumbnailIds = (data ?? [])
    .map((s) => s.thumbnail_file_id)
    .filter(Boolean);

  const { data: files } = await supabase
    .from('files')
    .select('id, url')
    .in('id', thumbnailIds);

  const fileMap = new Map(files?.map((f) => [f.id, f.url]));
  const baseURL = 'https://bfv-vsa.fra1.digitaloceanspaces.com/';

  const enrichedSzenen = (data ?? []).map((szene) => ({
    ...szene,
    thumbnail_path: fileMap.get(szene.thumbnail_file_id)?.replace(baseURL, '') ?? null,
  }));

  return (
    <div className="w-11/12 mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Alle Szenen</h1>

      <FilterComponent
        activeTab={tab}
        selectedCategory={kategorie}
        selectedTheme={selectedThemes}
        minRating={ratingMin}
        maxRating={ratingMax}
        selectedSeason={saison}
        selectedLeague={liga}
        selectedClub={verein}
        vereine={vereineList ?? []}
      />

<div className="flex flex-wrap -mx-2 mt-6">
  {enrichedSzenen.map((szene) => (
    <SzeneKarte key={szene.id} szene={szene} />
  ))}
</div>


      <Pagination
        totalItems={count || 0}
        currentPage={currentPage}
        itemsPerPage={pageSize}
      />
    </div>
  );
}
