import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import SignedVideoPlayer from '@/components/SignedVideoPlayer'

type ParamsType = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { id } = await params;
  const supabase = await createClient()

  const { data: videoszene, error } = await supabase
    .from('videoszenen')
    .select('*, file:video_file_id (id, hash, ext, folder_path)')
    .eq('id', id) // ✅ ← hier war vorher noch params.id
    .single()

  if (error || !videoszene) return notFound()

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
                hash={videoszene.file.hash}
                ext={videoszene.file.ext}
                folder={videoszene.file.folder_path?.replace(/^\//, '') || ''}
            />


          <div>
            <p className="text-sm text-muted-foreground">Beschreibung</p>
            <p>{videoszene.beschreibung || 'Keine Beschreibung vorhanden.'}</p>
          </div>

          {videoszene.spielstrafe && (
            <div>
              <p className="text-sm text-muted-foreground">Spielstrafen</p>
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
  )
}

