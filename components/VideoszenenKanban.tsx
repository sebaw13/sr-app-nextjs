'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // ✅ nur das

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const statusGroups = ['erstellt', 'geschnitten', 'published'];

export default function VideoszenenKanban() {
  const [videoszenen, setVideoszenen] = useState<any[]>([]);
  const router = useRouter(); // ✅

  const fetchSignedUrl = async (url: string) => {
    try {
      const key = url.replace(/^https?:\/\/[^/]+\/?/, '');
      const res = await fetch(`/api/signed-url?key=${encodeURIComponent(key)}`);
      const json = await res.json();
      return json.signedUrl ?? null;
    } catch (err) {
      console.error('Fehler beim Abrufen des signierten Links:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('videoszenen')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setVideoszenen([]);
        return;
      }

      const result = await Promise.all(
        (data || []).map(async (szene) => {
          if (!szene.thumbnail_path) return szene;

          const signedUrl = await fetchSignedUrl(szene.thumbnail_path);
          return { ...szene, signedUrl };
        })
      );

      setVideoszenen(result);
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {statusGroups.map((status) => {
        const filtered = videoszenen.filter((v) => v.arbeitsstatus === status);

        return (
          <div key={status}>
            <h2 className="text-xl font-semibold mb-2 capitalize">{status}</h2>
            <ScrollArea className="h-[70vh] pr-2">
              <div className="space-y-2">
                {filtered.map((szene) => {
                  const thumbnailUrl =
                    (status === 'geschnitten' || status === 'published') && szene.signedUrl
                      ? szene.signedUrl
                      : null;

                  return (
                    <Card
                      key={szene.id}
                      className="shadow-md cursor-pointer hover:bg-accent transition"
                      onClick={() => router.push(`/dashboard/videoszenen-verwalten/${szene.id}`)}
                    >
                      <CardContent className="p-4">
                        {thumbnailUrl && (
                          <div className="mb-3">
                            <Image
                              src={thumbnailUrl}
                              alt={`Thumbnail ${szene.titel}`}
                              width={320}
                              height={180}
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-medium">{szene.titel}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {szene.beschreibung?.substring(0, 80)}...
                        </p>
                        <Badge variant="outline">{szene.arbeitsstatus}</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
