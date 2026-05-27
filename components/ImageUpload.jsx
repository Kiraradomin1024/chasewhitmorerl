"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

/**
 * Upload une image via ImgChest (proxy edge function), sauve l'URL dans
 * characters.image_url et notifie le parent via onUploaded.
 */
export default function ImageUpload({ value, onUploaded, characterId }) {
  const { isAdmin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  if (!isAdmin) return null;

  const handle = async (file) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const url = await uploadImage(file);
      const sb = getSupabase();
      const { error: dbErr } = await sb
        .from("characters")
        .update({ image_url: url })
        .eq("id", characterId);
      if (dbErr) throw new Error(dbErr.message);
      onUploaded?.(url);
    } catch (e) {
      setError(e.message || "erreur upload");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mt-2"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        handle(e.dataTransfer.files?.[0]);
      }}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40 hover:text-rust transition disabled:opacity-50"
      >
        {busy
          ? "upload..."
          : value
          ? "✎ changer photo / glisser ici"
          : "+ photo (clic ou glisser)"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {error && (
        <div className="mt-1 font-mono text-[10px] text-rust handwritten">
          « {error} »
        </div>
      )}
    </div>
  );
}
