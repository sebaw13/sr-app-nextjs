'use client';

import { useState } from 'react';
import VideoUpload from './VideoUpload';
import { useRouter } from 'next/navigation';

export default function VideoUploadWrapper({ videoszeneId }: { videoszeneId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUploaded = async (fileId: number) => {
    setLoading(true);
    const res = await fetch('/api/videoszene/setVideo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoszeneId, fileId }),
    });

    if (res.ok) {
      router.refresh(); // Aktualisiert die Seite nach Upload
    } else {
      alert('Fehler beim Verknüpfen des Videos');
    }

    setLoading(false);
  };

  return (
    <>
      {loading && <p className="text-muted-foreground">Verknüpfe Video...</p>}
      <VideoUpload onUploaded={handleUploaded} />
    </>
  );
}
