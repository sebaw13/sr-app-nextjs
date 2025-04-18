// Datei: app/api/video-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACE_ENDPOINT,
  accessKeyId: process.env.DO_SPACE_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACE_SECRET_KEY,
  signatureVersion: 'v4',
})

const BUCKET_NAME = process.env.DO_SPACE_BUCKET || 'bfv-vsa'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key) return new NextResponse('Missing key', { status: 400 })

  try {
    const object = await s3
      .getObject({ Bucket: BUCKET_NAME, Key: key })
      .promise()

    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Cache-Control', 'public, max-age=3600')

    return new NextResponse(object.Body as any, { status: 200, headers })
  } catch (error) {
    console.error('DO Video Proxy Error:', error)
    return new NextResponse('Video not found', { status: 404 })
  }
}