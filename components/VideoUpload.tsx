'use client';

import { useRef, useState } from 'react';

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
        // Trigger Thumbnail
        await fetch('/api/process-thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey, fileId }),
        });

        // Call parent callback to update videoszene
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
    <div className="p-4 border rounded-xl space-y-4 bg-white shadow">
      <input type="file" accept="video/*" ref={fileInputRef} />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Wird hochgeladen...' : 'Video hochladen'}
      </button>
      {uploading && <div className="text-sm text-gray-600">Fortschritt: {progress}%</div>}
    </div>
  );
}
