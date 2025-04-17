// /app/api/signed-url/route.ts

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest } from 'next/server';

const s3 = new S3Client({
  region: 'eu-central-1',
  endpoint: process.env.DO_SPACE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY!,
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY!,
  },
  forcePathStyle: false,
});

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json(); // Hole den key aus dem Request Body

    if (!key || typeof key !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid "key"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.DO_SPACE_BUCKET!,
      Key: key,
    });

    let signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    signedUrl = signedUrl.replace(/(&|\?)x-amz-checksum-mode=[^&]+/, '');

    return new Response(JSON.stringify({ url: signedUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('❌ Fehler beim Abrufen der Signed URL:', JSON.stringify(err, null, 2));
    return new Response(JSON.stringify({ error: 'Failed to create signed URL', details: err?.Code }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
