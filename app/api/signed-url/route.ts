// app/api/signed-url/route.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest } from 'next/server';

const s3 = new S3Client({
  region: 'eu-central-1',
  endpoint: process.env.DO_SPACE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY!,
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY!,
  },
  forcePathStyle: false,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key } = body;

  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing "key" in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.DO_SPACE_BUCKET,
    Key: key,
    ResponseContentType: 'video/mp4', // optional, aber praktisch
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return new Response(JSON.stringify({ url: signedUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate signed URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
