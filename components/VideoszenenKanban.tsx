'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const statusGroups = ['erstellt', 'geschnitten', 'published']

export default function VideoszenenKanban() {
  const [videoszenen, setVideoszenen] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('videoszenen')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Szenen:', error.message)
        setVideoszenen([])
        return
      }

      const thumbnailIds = (data ?? []).map((s) => s.thumbnail_file_id).filter(Boolean)

      const { data: files } = await supabase
        .from('files')
        .select('id, url')
        .in('id', thumbnailIds)

      const fileMap = new Map(files?.map((f) => [f.id, f.url]))
      const baseURL = 'https://bfv-vsa.fra1.digitaloceanspaces.com/'

      const enriched = (data ?? []).map((szene) => ({
        ...szene,
        thumbnail_path: fileMap.get(szene.thumbnail_file_id)?.replace(baseURL, '') ?? null,
      }))

      setVideoszenen(enriched)
    }

    fetchData()
  }, [])

  return (
    <div className="flex gap-6 px-4 pb-4">
      {statusGroups.map((status) => {
        const filtered = videoszenen.filter((v) => v.arbeitsstatus === status)

        return (
          <Card key={status} className="flex-1 p-4">
            <CardHeader className="text-xl font-semibold capitalize mb-4">
              {status}
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="flex flex-col gap-4">
                {filtered.map((szene) => (
                  <Card key={szene.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {szene.thumbnail_path && (
                        <Image
                          src={`/api/image-proxy?key=${encodeURIComponent(szene.thumbnail_path)}`}
                          alt={szene.titel}
                          width={640}
                          height={360}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-1 line-clamp-2">{szene.titel}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {szene.beschreibung?.slice(0, 80)}{szene.beschreibung?.length > 80 ? '...' : ''}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(szene.themen)
                            ? szene.themen
                            : (() => {
                                try {
                                  return JSON.parse(szene.themen || '[]')
                                } catch {
                                  return []
                                }
                              })()
                          ).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )
      })}
    </div>
  )
}