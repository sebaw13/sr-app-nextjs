import { NextRequest } from 'next/server';

const SPACE_URL = 'https://bfv-vsa.fra1.digitaloceanspaces.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return new Response('Missing "key" parameter', { status: 400 });
  }

  const objectUrl = `${SPACE_URL}/${key}`;

  const response = await fetch(objectUrl, {
    // Kein Auth-Header nötig, wenn getSignedUrl schon öffentlich signiert ist
    // oder wenn der Space ACL Zugriff per IP/Server zulässt
  });

  if (!response.ok) {
    console.error(`❌ Fehler beim Laden von ${objectUrl}`, response.status);
    return new Response('Fehler beim Laden des Bildes', { status: 500 });
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Caching im CDN/Browser
    },
  });
}
