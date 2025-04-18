'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SzenenGrid() {
  const [szenen, setSzenen] = useState<any[]>([])

  useEffect(() => {
    const fetchSzenen = async () => {
      const { data, error } = await supabase
        .from('videoszenen')
        .select('*')
        .eq('arbeitsstatus', 'published')
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) {
        console.error('Fehler beim Abrufen der Szenen:', error.message)
        return
      }

      const thumbnailIds = data.map((s) => s.thumbnail_file_id).filter(Boolean)
      const { data: files } = await supabase
        .from('files')
        .select('id, url')
        .in('id', thumbnailIds)

      const fileMap = new Map(files?.map((f) => [f.id, f.url]))
      const baseURL = 'https://bfv-vsa.fra1.digitaloceanspaces.com/'

      const enriched = data.map((szene) => ({
        ...szene,
        thumbnail_path: fileMap.get(szene.thumbnail_file_id)?.replace(baseURL, '') ?? null,
      }))

      setSzenen(enriched)
    }

    fetchSzenen()
  }, [])

  return (
    <section className="mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Veröffentlichte Szenen</h2>
        <p className="text-sm text-muted-foreground">
          Kürzlich freigegebene Videoszenen aus dem SR-Portal.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {szenen.map((szene) => (
          <Link key={szene.id} href={`/videoszene/${szene.id}`} className="group">
            <Card className="overflow-hidden rounded-xl">
              {szene.thumbnail_path && (
                <Image
                  src={`/api/image-proxy?key=${encodeURIComponent(szene.thumbnail_path)}`}
                  alt={szene.titel}
                  width={300}
                  height={170}
                  className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                />
              )}
              <CardContent className="p-3">
                <CardTitle className="text-sm font-semibold leading-none mb-1 line-clamp-2">
                  {szene.titel}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {szene.beschreibung?.slice(0, 80)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
