import { useState } from "react";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export function useFileUpload() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [uploading, setUploading] = useState(false);

  async function upload(file, storageType = "assignment") {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Tipo de archivo no permitido.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("El archivo supera 5 MB.");
    }

    setUploading(true);
    try {
      const presignRes = await fetch(`${API_URL}/tutor/storage/presign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: storageType,
          filename: file.name,
          contentType: file.type,
        }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.message || "Error preparando archivo");

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Error subiendo archivo a Cellar");

      return presignData.fileKey;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, allowedTypes: ALLOWED_TYPES };
}
