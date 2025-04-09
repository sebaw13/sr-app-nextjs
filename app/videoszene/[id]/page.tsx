// app/videoszene/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SignedVideoPlayer from '@/components/SignedVideoPlayer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type ParamsType = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: videoszene, error } = await supabase
    .from('videoszenen')
    .select('*, file:video_file_id (id, hash, ext, url)')
    .eq('id', (await params).id)
    .single();

  if (error || !videoszene) return notFound();
  if (videoszene.arbeitsstatus !== 'published') redirect('/');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Titel */}
      <h1 className="text-3xl font-bold">{videoszene.titel}</h1>

      {/* Quelle-Label */}
      {videoszene.quelle === 'DFB' && (
        <div className="mt-2">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
            DFB
          </span>
        </div>
      )}
      {videoszene.quelle === 'UEFA' && (
        <div className="mt-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            UEFA
          </span>
        </div>
      )}

      {/* Video oder Hinweis */}
      {videoszene.file ? (
        <SignedVideoPlayer
          hash={videoszene.file.hash}
          ext={videoszene.file.ext}
        />
      ) : (
        <p className="text-muted-foreground italic">Kein Video verfügbar.</p>
      )}

      {/* Download-Button oder Hinweis */}
      {videoszene.download && videoszene.file?.url && (
        <div>
          <a href={videoszene.file.url} download>
            <Button variant="outline">Video herunterladen</Button>
          </a>
        </div>
      )}
      {!videoszene.download && (
        <p className="text-sm text-muted-foreground italic">
          Dieses Video steht nicht zum Download bereit und darf nur innerhalb des Portals verwendet werden.
        </p>
      )}

      {/* Tabs */}
      <Tabs defaultValue="beschreibung" className="w-full pt-6">
        <TabsList>
          <TabsTrigger value="beschreibung">Beschreibung</TabsTrigger>
          <TabsTrigger value="entscheidung">Entscheidung</TabsTrigger>
          <TabsTrigger value="bewertung">Bewertung</TabsTrigger>
        </TabsList>

        {/* Tab: Beschreibung */}
        <TabsContent value="beschreibung">
          <div className="pt-4 space-y-2">
            {videoszene.beschreibung ? (
              <p>{videoszene.beschreibung}</p>
            ) : (
              <p className="text-muted-foreground italic">Keine Beschreibung vorhanden.</p>
            )}
            {videoszene.timecode && (
              <p className="text-sm text-muted-foreground">
                <strong>Timecode:</strong> {videoszene.timecode}
              </p>
            )}
            {videoszene.quelle && (
              <p className="text-sm text-muted-foreground">
                <strong>Quelle:</strong> {videoszene.quelle}
              </p>
            )}
          </div>
        </TabsContent>

        {/* Tab: Entscheidung */}
        <TabsContent value="entscheidung">
          <div className="pt-4 space-y-2">
            {videoszene.spielstrafe && (
              <p><strong>Spielstrafe:</strong> {videoszene.spielstrafe}</p>
            )}
            {videoszene.persoenliche_strafe && (
              <p><strong>Persönliche Strafe:</strong> {videoszene.persoenliche_strafe}</p>
            )}
            {(videoszene.download || videoszene.konfi_relevant) && (
              <div className="flex gap-2 pt-2">
                {videoszene.download && <Badge>Downloadbar</Badge>}
                {videoszene.konfi_relevant && <Badge>Konfi-Test</Badge>}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Bewertung */}
        <TabsContent value="bewertung">
          <div className="pt-4 space-y-4">
            {videoszene.bewertungen?.length ? (
              videoszene.bewertungen.map((b: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center gap-4">
                    <span className="w-32 font-medium">{b.kategorie}</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((val) => (
                        <input
                          key={val}
                          type="radio"
                          name={`bewertung-${index}`}
                          value={val}
                          checked={val === b.bewertung}
                          disabled
                          className="h-4 w-4 accent-blue-600"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pl-32 flex gap-[0.875rem] text-xs text-muted-foreground mt-1">
                    {[1, 2, 3, 4, 5, 6].map((val) => (
                      <span key={val} className="w-4 text-center">{val}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">Keine Bewertung vorhanden.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
