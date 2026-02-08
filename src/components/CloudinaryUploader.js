"use client";

import { useRef, useState } from "react";

export default function CloudinaryUploader({ onUploaded }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function uploadFiles(files) {
    if (!cloudName || !uploadPreset) {
      setErr("Lipsește Cloudinary config în .env.local");
      return;
    }
    setErr("");
    setBusy(true);

    try {
      const uploaded = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: form },
        );

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        uploaded.push({
          url: data.secure_url,
          width: data.width,
          height: data.height,
          public_id: data.public_id,
          original_filename: data.original_filename,
          created_at: data.created_at,
        });
      }

      onUploaded?.(uploaded);
    } catch (e) {
      setErr("Nu am putut urca pozele. Verifică preset-ul și cloud name.");
    } finally {
      setBusy(false);
    }
  }

  function onPick(e) {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) uploadFiles(files);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) uploadFiles(files);
  }

  return (
    <div className="space-y-3">
      <div
        className={[
          "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6",
          "transition",
          dragOver ? "bg-cyan-300/10 border-cyan-200/20" : "",
        ].join(" ")}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/90 font-medium">
              Încarcă poze (drag & drop)
            </p>
            <p className="text-white/60 text-sm">
              JPG / PNG / HEIC (dacă browserul îl suportă). Se urcă în
              Cloudinary.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-xl bg-cyan-300/20 border border-cyan-200/20 hover:bg-cyan-300/30 transition px-4 py-2 font-medium"
            >
              {busy ? "Urc..." : "Alege fișiere"}
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="hidden"
        />
      </div>

      {err ? <p className="text-sm text-red-300">{err}</p> : null}
    </div>
  );
}
