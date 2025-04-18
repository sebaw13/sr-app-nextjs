'use client'

import { useEffect, useRef, useState } from 'react'

interface Mp4VideoPlayerProps {
  hash: string
  folder?: string
  ext?: string // Standard: ".mp4"
}

export default function Mp4VideoPlayer({ hash, folder = '', ext = '.mp4' }: Mp4VideoPlayerProps) {
  const fileKey = `${folder ? `${folder}/` : ''}${hash}${ext}`
  const proxyUrl = `/api/video-proxy?key=${encodeURIComponent(fileKey)}`
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Optional: vorab HEAD prüfen oder preload logic
  }, [proxyUrl])

  if (error) return <p className="text-red-600">{error}</p>

  return (
    <video
      controls
      width="100%"
      style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
    >
      <source src={proxyUrl} type="video/mp4" />
      Dein Browser unterstützt das Video-Tag nicht.
    </video>
  )
}