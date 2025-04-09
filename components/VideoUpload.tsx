'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // optional, wenn vorhanden

type Props = {
  onUploaded?: (fileId: number) => void;
};

export default function VideoUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const res = await fetch('/api/uploadVideo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });

    const { uploadUrl, fileKey, fileId, error } = await res.json();
    if (error || !uploadUrl) {
      alert('Fehler beim Abrufen der Upload-URL');
      setUploading(false);
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        await fetch('/api/process-thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey, fileId }),
        });

        if (onUploaded) onUploaded(fileId);
      } else {
        alert('Upload fehlgeschlagen.');
      }
      setUploading(false);
    };

    xhr.onerror = () => {
      alert('Netzwerkfehler beim Hochladen');
      setUploading(false);
    };

    xhr.send(file);
  };

  return (
    <div className="p-4 border rounded-xl space-y-4 bg-white shadow max-w-md">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="video">Video hochladen</Label>
        <Input
          id="video"
          type="file"
          accept="video/*"
          ref={fileInputRef}
          disabled={uploading}
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? `Wird hochgeladen… (${progress}%)` : 'Video hochladen'}
      </Button>

      {uploading && (
        <div className="text-sm text-muted-foreground">Fortschritt: {progress}%</div>
      )}
    </div>
  );
}
