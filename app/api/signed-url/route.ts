import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from '@aws-sdk/client-s3';
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

  // Automatisch Content-Type je nach Dateityp
  const contentType = key.endsWith(".jpg") ? "image/jpeg"
                   : key.endsWith(".jpeg") ? "image/jpeg"
                   : key.endsWith(".png") ? "image/png"
                   : key.endsWith(".mp4") ? "video/mp4"
                   : key.endsWith(".pdf") ? "application/pdf"
                   : "application/octet-stream";



  const command = new GetObjectCommand({
    Bucket: process.env.DO_SPACE_BUCKET,  // Dein DigitalOcean Space Bucket
    Key: key,  // Der exakte Dateiname
    ResponseContentType: contentType,  // Optional: Bestimmt den Content-Type
  });
  

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Hier den checksum-mode aus der URL entfernen, falls vorhanden
    const fixedUrl = signedUrl.replace(/&x-amz-checksum-mode=[^&]*/, '');

    // Debugging: Logge die korrigierte URL
    console.log("🧪 Generierte URL (ohne checksum-mode):", fixedUrl);

    return new Response(JSON.stringify({ url: fixedUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("❌ Signed URL Fehler:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate signed URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
