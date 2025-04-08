import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import Image from 'next/image';
import SignedVideoPlayer from '@/components/SignedVideoPlayer';

export default async function VideoszeneDetailPage({
  params,
}: {
  params: { videoszenenId: string };
}) {
  const { videoszenenId } = params;
  console.log('Lade Detailseite für Videoszene ID:', videoszenenId);

  const supabase = await createClient();
  const { data: videoszene, error } = await supabase
    .from('videoszenen')
    .select('*, file:video_file_id (id, url)')
    .eq('id', videoszenenId)
    .single();

  if (error || !videoszene) {
    console.error('Fehler beim Laden der Videoszene:', error);
    return notFound();
  }

  console.log('Geladene Videoszene:', videoszene);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{videoszene.titel}</CardTitle>
          <CardDescription className="text-muted-foreground">
            ID: {videoszene.id} | Status:{' '}
            <Badge variant="outline">{videoszene.arbeitsstatus}</Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <SignedVideoPlayer
            hash="41_Fuerth_II_FWK_1511bf0e4a"
            ext=".mp4"
          />

          <div>
            <p className="text-sm text-muted-foreground">Beschreibung</p>
            <p>{videoszene.beschreibung || 'Keine Beschreibung vorhanden.'}</p>
          </div>

          {videoszene.spielstrafe && (
            <div>
              <p className="text-sm text-muted-foreground">Spielstrafe</p>
              <p>{videoszene.spielstrafe}</p>
            </div>
          )}

          {videoszene.persoenliche_strafe && (
            <div>
              <p className="text-sm text-muted-foreground">Persönliche Strafe</p>
              <p>{videoszene.persoenliche_strafe}</p>
            </div>
          )}

          {videoszene.timecode && (
            <div>
              <p className="text-sm text-muted-foreground">Timecode</p>
              <p>{videoszene.timecode}</p>
            </div>
          )}

          {videoszene.quelle && (
            <div>
              <p className="text-sm text-muted-foreground">Quelle</p>
              <p>{videoszene.quelle}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4 items-center">
            <Toggle pressed={videoszene.download} aria-label="Download erlauben">
              Downloadbar
            </Toggle>

            <Toggle pressed={videoszene.konfi_relevant} aria-label="Konfi relevant">
              Konfi-Test
            </Toggle>

            {videoszene.locked && <Badge variant="destructive">Gesperrt</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
