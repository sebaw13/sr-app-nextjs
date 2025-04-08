// components/SignedVideoPlayer.tsx
'use client';

import { useEffect, useState } from 'react';

type Props = {
  hash: string;
  ext: string;
  folder?: string;
};

export default function SignedVideoPlayer({ hash, ext, folder = '' }: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileKey = `${folder ? `${folder}/` : ''}${hash}${ext}`;

  const fetchSignedUrl = async () => {
    try {
      const res = await fetch(`/api/signed-url?fileName=${encodeURIComponent(fileKey)}`);
      const data = await res.json();
  
      if (res.ok) {
        setVideoUrl(data.url);
      } else {
        setError(data.error || 'Fehler beim Abrufen der Video-URL');
      }
    } catch (err) {
      setError('Netzwerkfehler beim Abrufen der Video-URL');
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <p>Lade Video...</p>;
  if (error) return <p>Fehler: {error}</p>;
  if (!videoUrl) return <p>Keine Video-URL verfügbar</p>;

  return (
    <video controls width="100%" style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
      <source src={videoUrl} type="video/mp4" />
      Dein Browser unterstützt das Video-Tag nicht.
    </video>
  );
}
