import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { fileKey, fileId } = await req.json();

  if (!fileKey || !fileId) {
    return new Response(JSON.stringify({ error: 'Missing fileKey or fileId' }), { status: 400 });
  }

  const s3 = new AWS.S3({
    endpoint: process.env.DO_SPACE_ENDPOINT,
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY!,
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY!,
    region: 'fra1',
  });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const tempVideoPath = `/tmp/${Date.now()}-video.mp4`;
  const tempThumbPath = `/tmp/${Date.now()}-thumb.jpg`;
  const thumbKey = fileKey.replace(/^uploads\//, 'thumbnails/').replace(/\.mp4$/, '.jpg');

  try {
    // 1. Video herunterladen
    const videoStream = s3.getObject({
      Bucket: process.env.DO_SPACE_BUCKET!,
      Key: fileKey,
    }).createReadStream();

    const file = fs.createWriteStream(tempVideoPath);
    await new Promise((resolve, reject) => {
      videoStream.pipe(file).on('finish', resolve).on('error', reject);
    });

    // 2. Screenshot erzeugen mit FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .on('end', resolve)
        .on('error', reject)
        .screenshots({
          timestamps: ['5'],
          filename: path.basename(tempThumbPath),
          folder: path.dirname(tempThumbPath),
          size: '640x?',
        });
    });

    // 3. Hochladen Thumbnail
    const thumbBuffer = fs.readFileSync(tempThumbPath);
    await s3.putObject({
      Bucket: process.env.DO_SPACE_BUCKET!,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    // 4. Supabase-Update
    const publicThumbUrl = `https://${process.env.DO_SPACE_BUCKET}.${process.env.DO_SPACE_ENDPOINT}/${thumbKey}`;
    await supabase.from('files').update({
      thumbnail_url: publicThumbUrl,
      status: 'ready',
    }).eq('id', fileId);

    // 5. Clean up
    fs.unlinkSync(tempVideoPath);
    fs.unlinkSync(tempThumbPath);

    return new Response(JSON.stringify({ message: 'Thumbnail erstellt & gespeichert' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[THUMBNAIL ERROR]', error.message);
    return new Response(JSON.stringify({ error: 'Thumbnail-Erzeugung fehlgeschlagen' }), { status: 500 });
  }
}
